import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// POST: Buscar proveedores cercanos
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      latitude,
      longitude,
      radius = 10, // km
      serviceTypeId,
      limit = 20,
      sortBy = "distance", // distance, rating, price
    } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Coordenadas requeridas" }, { status: 400 })
    }

    // Usar la fórmula de Haversine para calcular distancia
    const haversineQuery = `
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(pl.latitude)) * 
        cos(radians(pl.longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(pl.latitude))
      ))
    `

    // Construir query base
    let query = `
      SELECT DISTINCT
        p.id,
        p."userId",
        p.bio,
        p."serviceTypeId",
        p.price,
        p.rating,
        p."reviewCount",
        p."isAvailable",
        u.name,
        u.email,
        u.phone,
        u.image,
        st.name as "serviceTypeName",
        st.icon as "serviceTypeIcon",
        ${haversineQuery} as distance,
        pl.latitude,
        pl.longitude,
        pl.timestamp as "lastLocationUpdate"
      FROM "Provider" p
      INNER JOIN "User" u ON p."userId" = u.id
      INNER JOIN "ServiceType" st ON p."serviceTypeId" = st.id
      INNER JOIN LATERAL (
        SELECT latitude, longitude, timestamp
        FROM "ProviderLocation" 
        WHERE "userId" = p."userId"
        ORDER BY timestamp DESC
        LIMIT 1
      ) pl ON true
      WHERE p."isAvailable" = true
        AND ${haversineQuery} <= ${radius}
    `

    const params: any[] = []

    // Filtrar por tipo de servicio si se especifica
    if (serviceTypeId) {
      query += ` AND p."serviceTypeId" = $${params.length + 1}`
      params.push(serviceTypeId)
    }

    // Filtrar ubicaciones recientes (últimas 24 horas)
    query += ` AND pl.timestamp >= NOW() - INTERVAL '24 hours'`

    // Ordenamiento
    switch (sortBy) {
      case "rating":
        query += ` ORDER BY p.rating DESC, distance ASC`
        break
      case "price":
        query += ` ORDER BY p.price ASC, distance ASC`
        break
      default: // distance
        query += ` ORDER BY distance ASC`
    }

    query += ` LIMIT ${limit}`

    const nearbyProviders = await prisma.$queryRawUnsafe(query, ...params)

    // Obtener servicios de cada proveedor
    const providerIds = (nearbyProviders as any[]).map((p) => p.userId)

    const providerServices = await prisma.providerService.findMany({
      where: {
        providerId: { in: providerIds },
        isActive: true,
      },
      select: {
        id: true,
        providerId: true,
        name: true,
        description: true,
        price: true,
        priceType: true,
        duration: true,
        tags: true,
      },
    })

    // Agrupar servicios por proveedor
    const servicesByProvider = providerServices.reduce(
      (acc, service) => {
        if (!acc[service.providerId]) {
          acc[service.providerId] = []
        }
        acc[service.providerId].push(service)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Formatear respuesta
    const formattedProviders = (nearbyProviders as any[]).map((provider) => ({
      id: provider.id,
      user: {
        id: provider.userId,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        image: provider.image,
      },
      bio: provider.bio,
      serviceType: {
        id: provider.serviceTypeId,
        name: provider.serviceTypeName,
        icon: provider.serviceTypeIcon,
      },
      price: provider.price,
      rating: Number(provider.rating),
      reviewCount: provider.reviewCount,
      isAvailable: provider.isAvailable,
      location: {
        latitude: Number(provider.latitude),
        longitude: Number(provider.longitude),
        lastUpdate: provider.lastLocationUpdate,
      },
      distance: Math.round(Number(provider.distance) * 100) / 100, // Redondear a 2 decimales
      services: servicesByProvider[provider.id] || [],
    }))

    // Estadísticas de búsqueda
    const searchStats = {
      totalFound: formattedProviders.length,
      averageDistance:
        formattedProviders.length > 0
          ? formattedProviders.reduce((sum, p) => sum + p.distance, 0) / formattedProviders.length
          : 0,
      averageRating:
        formattedProviders.length > 0
          ? formattedProviders.reduce((sum, p) => sum + p.rating, 0) / formattedProviders.length
          : 0,
      searchRadius: radius,
      searchLocation: { latitude, longitude },
    }

    return NextResponse.json({
      providers: formattedProviders,
      stats: searchStats,
      searchParams: {
        latitude,
        longitude,
        radius,
        serviceTypeId,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Error buscando proveedores cercanos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
