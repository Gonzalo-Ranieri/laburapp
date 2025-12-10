import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// POST: Búsqueda avanzada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query = "",
      serviceTypes = [],
      location = {},
      priceRange = {},
      rating = 0,
      availability = "any",
      sortBy = "relevance",
      page = 1,
      limit = 20,
      filters = {},
    } = body

    const skip = (page - 1) * limit

    // Construir filtros dinámicos
    const where: any = {}

    // Búsqueda por texto
    if (query) {
      where.OR = [
        { user: { name: { contains: query, mode: "insensitive" } } },
        { bio: { contains: query, mode: "insensitive" } },
        { serviceType: { name: { contains: query, mode: "insensitive" } } },
        {
          services: {
            some: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            },
          },
        },
      ]
    }

    // Filtro por tipos de servicio
    if (serviceTypes.length > 0) {
      where.serviceTypeId = { in: serviceTypes }
    }

    // Filtro por rating mínimo
    if (rating > 0) {
      where.rating = { gte: rating }
    }

    // Filtro por disponibilidad
    if (availability === "available") {
      where.isAvailable = true
    } else if (availability === "immediate") {
      where.AND = [{ isAvailable: true }]
      // Aquí podrías agregar lógica para disponibilidad inmediata
    }

    // Filtros de precio en servicios
    if (priceRange.min || priceRange.max) {
      const priceFilter: any = {}
      if (priceRange.min) priceFilter.gte = priceRange.min
      if (priceRange.max) priceFilter.lte = priceRange.max

      where.services = {
        some: {
          price: priceFilter,
          isActive: true,
        },
      }
    }

    // Filtros adicionales personalizados
    if (filters.hasReviews) {
      where.reviewCount = { gt: 0 }
    }

    if (filters.verified) {
      // Asumiendo que tienes un campo verified en Provider
      where.verified = true
    }

    // Determinar ordenamiento
    let orderBy: any = {}
    switch (sortBy) {
      case "rating":
        orderBy = [{ rating: "desc" }, { reviewCount: "desc" }]
        break
      case "price_low":
        orderBy = { services: { _min: { price: "asc" } } }
        break
      case "price_high":
        orderBy = { services: { _min: { price: "desc" } } }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "distance":
        // Para ordenar por distancia necesitarías coordenadas
        if (location.latitude && location.longitude) {
          // Implementar ordenamiento por distancia usando PostGIS o cálculo manual
          orderBy = { rating: "desc" } // Fallback
        } else {
          orderBy = { rating: "desc" }
        }
        break
      default: // relevance
        orderBy = [{ rating: "desc" }, { reviewCount: "desc" }]
    }

    // Ejecutar búsqueda
    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              icon: true,
              description: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              priceType: true,
              duration: true,
              tags: true,
            },
            where: { isActive: true },
            take: 3,
          },
          _count: {
            select: {
              services: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.provider.count({ where }),
    ])

    // Calcular distancia si se proporcionan coordenadas
    let providersWithDistance = providers
    if (location.latitude && location.longitude) {
      providersWithDistance = providers.map((provider) => {
        // Aquí implementarías el cálculo real de distancia
        // Por ahora, simulamos distancias
        const distance = Math.random() * 20 // 0-20 km
        return {
          ...provider,
          distance: Math.round(distance * 100) / 100,
        }
      })

      // Si se ordenó por distancia, reordenar
      if (sortBy === "distance") {
        providersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }
    }

    // Obtener facetas para filtros
    const facets = await Promise.all([
      // Tipos de servicio disponibles
      prisma.serviceType.findMany({
        where: {
          providers: {
            some: where,
          },
        },
        select: {
          id: true,
          name: true,
          icon: true,
          _count: {
            select: {
              providers: true,
            },
          },
        },
      }),

      // Rangos de precio
      prisma.providerService.aggregate({
        where: {
          provider: where,
          isActive: true,
        },
        _min: { price: true },
        _max: { price: true },
        _avg: { price: true },
      }),

      // Distribución de ratings
      prisma.provider.groupBy({
        by: ["rating"],
        where,
        _count: { rating: true },
      }),
    ])

    const [serviceTypeFacets, priceStats, ratingDistribution] = facets

    return NextResponse.json({
      providers: providersWithDistance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      facets: {
        serviceTypes: serviceTypeFacets,
        priceRange: {
          min: priceStats._min.price || 0,
          max: priceStats._max.price || 0,
          average: priceStats._avg.price || 0,
        },
        ratings: ratingDistribution,
      },
      searchMeta: {
        query,
        totalResults: total,
        searchTime: Date.now(), // Podrías calcular el tiempo real
      },
    })
  } catch (error) {
    console.error("Error en búsqueda avanzada:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
