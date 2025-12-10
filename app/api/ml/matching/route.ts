import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// POST: Algoritmo de matching inteligente
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      serviceTypeId,
      description,
      location,
      budget,
      urgency = "NORMAL", // LOW, NORMAL, HIGH, URGENT
      preferences = {},
    } = body

    // Obtener historial del usuario para análisis
    const userHistory = await prisma.serviceRequest.findMany({
      where: { clientId: user.id },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Análisis de patrones del usuario
    const userPatterns = analyzeUserPatterns(userHistory)

    // Obtener proveedores disponibles
    const availableProviders = await prisma.provider.findMany({
      where: {
        serviceTypeId,
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
          },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            priceType: true,
            duration: true,
            tags: true,
          },
        },
        _count: {
          select: {
            clientRequests: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    })

    // Calcular scores de matching para cada proveedor
    const scoredProviders = await Promise.all(
      availableProviders.map(async (provider) => {
        const score = await calculateMatchingScore(provider, {
          serviceTypeId,
          description,
          location,
          budget,
          urgency,
          preferences,
          userPatterns,
        })

        return {
          ...provider,
          matchingScore: score.total,
          scoreBreakdown: score.breakdown,
          reasons: score.reasons,
        }
      }),
    )

    // Ordenar por score y aplicar filtros adicionales
    const rankedProviders = scoredProviders
      .filter((p) => p.matchingScore > 0.3) // Umbral mínimo de compatibilidad
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 10) // Top 10 matches

    // Obtener ubicaciones recientes de los proveedores top
    const topProviderIds = rankedProviders.map((p) => p.user.id)
    const recentLocations = await prisma.providerLocation.findMany({
      where: {
        userId: { in: topProviderIds },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
        },
      },
      orderBy: { timestamp: "desc" },
      distinct: ["userId"],
    })

    // Agregar información de ubicación y distancia
    const providersWithLocation = rankedProviders.map((provider) => {
      const location_data = recentLocations.find((loc) => loc.userId === provider.user.id)
      let distance = null

      if (location_data && location.latitude && location.longitude) {
        distance = calculateDistance(
          location.latitude,
          location.longitude,
          location_data.latitude,
          location_data.longitude,
        )
      }

      return {
        ...provider,
        location: location_data
          ? {
              latitude: location_data.latitude,
              longitude: location_data.longitude,
              lastUpdate: location_data.timestamp,
            }
          : null,
        distance,
      }
    })

    // Generar insights del matching
    const insights = generateMatchingInsights(providersWithLocation, userPatterns)

    return NextResponse.json({
      matches: providersWithLocation,
      insights,
      searchCriteria: {
        serviceTypeId,
        description,
        location,
        budget,
        urgency,
        preferences,
      },
      userPatterns: {
        preferredPriceRange: userPatterns.preferredPriceRange,
        averageRatingGiven: userPatterns.averageRatingGiven,
        mostUsedServiceTypes: userPatterns.mostUsedServiceTypes,
        preferredTimeSlots: userPatterns.preferredTimeSlots,
      },
    })
  } catch (error) {
    console.error("Error en algoritmo de matching:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Funciones auxiliares para el algoritmo de ML
function analyzeUserPatterns(history: any[]) {
  const patterns = {
    preferredPriceRange: { min: 0, max: 0 },
    averageRatingGiven: 0,
    mostUsedServiceTypes: [] as string[],
    preferredTimeSlots: [] as string[],
    loyaltyToProviders: new Map<string, number>(),
    completionRate: 0,
    averageServiceDuration: 0,
  }

  if (history.length === 0) return patterns

  // Análisis de precios
  const prices = history.filter((h) => h.price).map((h) => h.price)
  if (prices.length > 0) {
    patterns.preferredPriceRange.min = Math.min(...prices)
    patterns.preferredPriceRange.max = Math.max(...prices)
  }

  // Análisis de ratings
  const ratings = history.filter((h) => h.review?.rating).map((h) => h.review.rating)
  if (ratings.length > 0) {
    patterns.averageRatingGiven = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  }

  // Tipos de servicios más utilizados
  const serviceTypeCount = history.reduce(
    (acc, h) => {
      acc[h.serviceTypeId] = (acc[h.serviceTypeId] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  patterns.mostUsedServiceTypes = Object.entries(serviceTypeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([typeId]) => typeId)

  // Lealtad a proveedores
  history.forEach((h) => {
    if (h.providerId) {
      const current = patterns.loyaltyToProviders.get(h.providerId) || 0
      patterns.loyaltyToProviders.set(h.providerId, current + 1)
    }
  })

  // Tasa de completación
  const completedRequests = history.filter((h) => h.status === "COMPLETED").length
  patterns.completionRate = history.length > 0 ? completedRequests / history.length : 0

  return patterns
}

async function calculateMatchingScore(provider: any, criteria: any) {
  const weights = {
    rating: 0.25,
    experience: 0.2,
    availability: 0.15,
    priceMatch: 0.15,
    location: 0.1,
    specialization: 0.1,
    userHistory: 0.05,
  }

  const scores = {
    rating: 0,
    experience: 0,
    availability: 0,
    priceMatch: 0,
    location: 0,
    specialization: 0,
    userHistory: 0,
  }

  const reasons: string[] = []

  // Score por rating
  scores.rating = Math.min(provider.rating / 5, 1)
  if (provider.rating >= 4.5) {
    reasons.push("Excelente calificación")
  }

  // Score por experiencia
  const completedJobs = provider._count.clientRequests
  scores.experience = Math.min(completedJobs / 50, 1) // Normalizar a 50 trabajos
  if (completedJobs >= 20) {
    reasons.push("Amplia experiencia")
  }

  // Score por disponibilidad
  scores.availability = provider.isAvailable ? 1 : 0
  if (provider.isAvailable) {
    reasons.push("Disponible ahora")
  }

  // Score por coincidencia de precio
  if (criteria.budget && provider.services.length > 0) {
    const avgPrice = provider.services.reduce((sum: number, s: any) => sum + s.price, 0) / provider.services.length
    const priceDiff = Math.abs(avgPrice - criteria.budget) / criteria.budget
    scores.priceMatch = Math.max(0, 1 - priceDiff)

    if (priceDiff < 0.2) {
      reasons.push("Precio dentro del presupuesto")
    }
  }

  // Score por especialización
  const relevantServices = provider.services.filter(
    (service: any) =>
      service.description.toLowerCase().includes(criteria.description.toLowerCase()) ||
      service.tags.some((tag: string) => criteria.description.toLowerCase().includes(tag.toLowerCase())),
  )
  scores.specialization = relevantServices.length / Math.max(provider.services.length, 1)

  if (relevantServices.length > 0) {
    reasons.push("Especializado en tu necesidad")
  }

  // Score por historial del usuario
  if (criteria.userPatterns.loyaltyToProviders.has(provider.user.id)) {
    scores.userHistory = 1
    reasons.push("Has trabajado con este proveedor antes")
  }

  // Calcular score total
  const total = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + score * weights[key as keyof typeof weights]
  }, 0)

  return {
    total,
    breakdown: scores,
    reasons,
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function generateMatchingInsights(providers: any[], userPatterns: any) {
  const insights = {
    totalMatches: providers.length,
    averageMatchScore: 0,
    topReasons: [] as string[],
    recommendations: [] as string[],
    priceAnalysis: {
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
    },
  }

  if (providers.length === 0) return insights

  // Score promedio
  insights.averageMatchScore = providers.reduce((sum, p) => sum + p.matchingScore, 0) / providers.length

  // Razones más comunes
  const reasonCount = providers.reduce(
    (acc, p) => {
      p.reasons.forEach((reason: string) => {
        acc[reason] = (acc[reason] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  insights.topReasons = Object.entries(reasonCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([reason]) => reason)

  // Análisis de precios
  const prices = providers.flatMap((p) => p.services.map((s: any) => s.price))
  if (prices.length > 0) {
    insights.priceAnalysis.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
    insights.priceAnalysis.priceRange.min = Math.min(...prices)
    insights.priceAnalysis.priceRange.max = Math.max(...prices)
  }

  // Recomendaciones personalizadas
  if (userPatterns.completionRate < 0.8) {
    insights.recommendations.push("Considera proveedores con alta calificación para mejorar tu experiencia")
  }

  if (providers.filter((p) => p.distance && p.distance < 5).length > 0) {
    insights.recommendations.push("Hay proveedores cercanos disponibles")
  }

  return insights
}
