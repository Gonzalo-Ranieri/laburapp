import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/providers/nearby
 *
 * Obtiene proveedores cercanos a una ubicación específica
 *
 * Parámetros:
 * - lat: Latitud
 * - lng: Longitud
 * - distance: Distancia máxima en kilómetros (por defecto 10km)
 * - category: ID de categoría para filtrar
 * - limit: Cantidad de resultados (por defecto 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const distance = searchParams.get("distance") ? Number.parseFloat(searchParams.get("distance")!) : 10
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    // Validar parámetros de ubicación
    if (!lat || !lng) {
      return NextResponse.json({ error: "Se requieren parámetros de ubicación (lat, lng)" }, { status: 400 })
    }

    // En modo de demostración, devolver datos de ejemplo
    if (process.env.DEMO_MODE === "true") {
      // Simular una pequeña latencia
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Crear proveedores de ejemplo cercanos a la ubicación dada
      const latitude = Number.parseFloat(lat)
      const longitude = Number.parseFloat(lng)

      // Factor de conversión aproximado: 0.01 grados ≈ 1.11 km en el ecuador
      // Pero varía según la latitud, así que lo ajustamos
      const latFactor = 0.009 // ≈ 1km
      const lngFactor = 0.009 / Math.cos((latitude * Math.PI) / 180)

      // Generar proveedores aleatorios en un radio
      const mockProviders = Array.from({ length: 15 }, (_, i) => {
        // Distancia aleatoria dentro del radio solicitado
        const randomDistance = Math.random() * distance
        // Ángulo aleatorio
        const randomAngle = Math.random() * 2 * Math.PI

        // Calcular desplazamiento
        const latOffset = Math.sin(randomAngle) * randomDistance * latFactor
        const lngOffset = Math.cos(randomAngle) * randomDistance * lngFactor

        return {
          id: `provider-${i + 1}`,
          userId: `user-${i + 1}`,
          name: [
            "Carlos Martínez",
            "Laura Rodríguez",
            "Juan Pérez",
            "Ana Gómez",
            "Pedro Sánchez",
            "Lucía Fernández",

            "Ana Gómez",
            "Pedro Sánchez",
            "Lucía Fernández",
            "Miguel Torres",
            "Sofía López",
            "Diego González",
            "Valentina Díaz",
            "Javier Ruiz",
            "Camila Herrera",
            "Roberto Silva",
            "Gabriela Castro",
            "Fernando Benítez",
            "Adriana Vargas",
          ][i % 14],
          image: `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
            ["CM", "LR", "JP", "AG", "PS", "LF", "MT", "SL", "DG", "VD", "JR", "CH", "RS", "GC"][i % 14],
          )}`,
          description: "Profesional con experiencia en diversos servicios del hogar y oficina",
          categories: [
            ["Electricidad", "Plomería"],
            ["Carpintería", "Pintura"],
            ["Limpieza", "Jardinería"],
            ["Electricidad", "Climatización"],
            ["Albañilería", "Pintura"],
            ["Limpieza", "Cuidado del hogar"],
            ["Plomería", "Gas"],
            ["Informática", "Electrónica"],
            ["Carpintería", "Albañilería"],
            ["Diseño", "Decoración"],
            ["Electricidad", "Electrónica"],
            ["Jardinería", "Paisajismo"],
            ["Cerrajería", "Seguridad"],
            ["Mudanzas", "Logística"],
          ][i % 14],
          rating: 4 + (i % 10) / 10,
          reviewCount: 10 + i * 3,
          verified: i % 3 === 0,
          location: {
            latitude: latitude + latOffset,
            longitude: longitude + lngOffset,
            address: `Calle Principal ${100 + i * 11}, CABA`,
          },
          distance: randomDistance,
          services: [
            {
              id: `service-${i * 2 + 1}`,
              name: "Instalación completa",
              price: 5000 + i * 500,
              category: ["Electricidad", "Plomería", "Carpintería", "Albañilería"][i % 4],
            },
            {
              id: `service-${i * 2 + 2}`,
              name: "Reparación",
              price: 2500 + i * 250,
              category: ["Electricidad", "Plomería", "Carpintería", "Albañilería"][i % 4],
            },
          ],
          availability: {
            immediate: i % 2 === 0,
            nextAvailable:
              i % 2 === 0 ? null : new Date(Date.now() + 24 * 60 * 60 * 1000 * (1 + (i % 3))).toISOString(),
          },
        }
      })

      // Filtrar por categoría si se especifica
      let filteredProviders = mockProviders
      if (category) {
        filteredProviders = filteredProviders.filter((p) =>
          p.categories.some((c) => c.toLowerCase() === category.toLowerCase()),
        )
      }

      // Limitar resultados
      filteredProviders = filteredProviders.slice(0, limit)

      return NextResponse.json({
        providers: filteredProviders,
        total: filteredProviders.length,
        center: { latitude, longitude },
      })
    }

    // Implementación real con base de datos
    // Nota: Esta es una implementación básica. Para una búsqueda geoespacial
    // real, se recomienda usar PostGIS o una solución espacial adecuada.

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    // Convertir distancia a grados (aproximación básica)
    // 1 grado ≈ 111km en el ecuador (varía con la latitud)
    const latDistance = distance / 111
    const lngDistance = distance / (111 * Math.cos((latitude * Math.PI) / 180))

    const whereClause: any = {
      location: {
        latitude: {
          gte: latitude - latDistance,
          lte: latitude + latDistance,
        },
        longitude: {
          gte: longitude - lngDistance,
          lte: longitude + lngDistance,
        },
      },
    }

    // Agregar filtro de categoría si se especifica
    if (category) {
      whereClause.categories = {
        some: {
          id: category,
        },
      }
    }

    // Buscar proveedores en la base de datos
    const providers = await db.providerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            active: true,
          },
          where: {
            active: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        location: true,
      },
      take: limit,
    })

    // Calcular distancia exacta y formatear la respuesta
    const formattedProviders = providers.map((provider) => {
      // Calcular distancia con la fórmula de Haversine
      const R = 6371 // Radio de la Tierra en km
      const dLat = ((provider.location.latitude - latitude) * Math.PI) / 180
      const dLon = ((provider.location.longitude - longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((provider.location.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c // Distancia en km

      return {
        id: provider.id,
        userId: provider.userId,
        name: provider.user.name,
        image: provider.user.image,
        description: provider.description,
        categories: provider.categories.map((c) => c.name),
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        verified: provider.verified,
        location: provider.location,
        distance: Math.round(distance * 10) / 10, // Redondear a 1 decimal
        services: provider.services,
        availability: {
          immediate: provider.immediateAvailability,
          nextAvailable: provider.nextAvailableDate,
        },
      }
    })

    // Ordenar por distancia
    formattedProviders.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      providers: formattedProviders,
      total: formattedProviders.length,
      center: { latitude, longitude },
    })
  } catch (error) {
    console.error("Error en /api/providers/nearby:", error)
    return NextResponse.json(
      {
        error: "Error al obtener proveedores cercanos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/providers/nearby
 *
 * Actualiza la ubicación del proveedor (usuario autenticado)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 })
    }

    // Verificar si el usuario es un proveedor
    const providerProfile = await db.providerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!providerProfile) {
      return NextResponse.json({ error: "El usuario no tiene un perfil de proveedor" }, { status: 400 })
    }

    const data = await request.json()

    // Validar datos de ubicación
    if (!data.latitude || !data.longitude || !data.address) {
      return NextResponse.json(
        { error: "Se requieren datos de ubicación (latitude, longitude, address)" },
        { status: 400 },
      )
    }

    // Actualizar o crear la ubicación del proveedor
    const location = await db.location.upsert({
      where: {
        providerId: providerProfile.id,
      },
      update: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
      },
      create: {
        providerId: providerProfile.id,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
      },
    })

    return NextResponse.json({
      success: true,
      location,
    })
  } catch (error) {
    console.error("Error en POST /api/providers/nearby:", error)
    return NextResponse.json(
      {
        error: "Error al actualizar ubicación del proveedor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
