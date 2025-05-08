import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/providers
 *
 * Obtiene una lista de proveedores de servicios
 *
 * Opcionalmente acepta parámetros de consulta para filtros:
 * - category: ID de la categoría
 * - service: ID del servicio
 * - query: Texto para buscar en nombre/descripción
 * - rating: Calificación mínima
 * - limit: Cantidad máxima de resultados
 * - offset: Índice para paginación
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const service = searchParams.get("service")
    const query = searchParams.get("query")
    const rating = searchParams.get("rating") ? Number.parseFloat(searchParams.get("rating")!) : null
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0

    // En modo de demostración, devolver datos de ejemplo
    if (process.env.DEMO_MODE === "true") {
      // Devolver proveedores de ejemplo con un pequeño retraso para simular
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockProviders = Array.from({ length: 12 }, (_, i) => ({
        id: `provider-${i + 1}`,
        userId: `user-${i + 1}`,
        name: [
          "Carlos Martínez",
          "Laura Rodríguez",
          "Juan Pérez",
          "Ana Gómez",
          "Pedro Sánchez",
          "Lucía Fernández",
          "Miguel Torres",
          "Sofía López",
          "Diego González",
          "Valentina Díaz",
          "Javier Ruiz",
          "Camila Herrera",
        ][i],
        image: `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
          ["CM", "LR", "JP", "AG", "PS", "LF", "MT", "SL", "DG", "VD", "JR", "CH"][i],
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
        ][i],
        rating: 4 + (i % 10) / 10,
        reviewCount: 10 + i * 3,
        verified: i % 3 === 0,
        location: {
          latitude: -34.603722 + (Math.random() * 0.1 - 0.05),
          longitude: -58.381592 + (Math.random() * 0.1 - 0.05),
          address: `Calle Principal ${100 + i * 11}, CABA`,
        },
        services: [
          {
            id: `service-${i * 2 + 1}`,
            name: "Instalación completa",
            price: 5000 + i * 500,
            category: ["Electricidad", "Plomería", "Carpintería"][i % 3],
          },
          {
            id: `service-${i * 2 + 2}`,
            name: "Reparación",
            price: 2500 + i * 250,
            category: ["Electricidad", "Plomería", "Carpintería"][i % 3],
          },
        ],
        availability: {
          immediate: i % 2 === 0,
          nextAvailable: i % 2 === 0 ? null : new Date(Date.now() + 24 * 60 * 60 * 1000 * (1 + (i % 3))).toISOString(),
        },
      }))

      // Aplicar filtros simulados
      let filteredProviders = mockProviders

      if (category) {
        filteredProviders = filteredProviders.filter((p) =>
          p.categories.some((c) => c.toLowerCase() === category.toLowerCase()),
        )
      }

      if (query) {
        const searchQuery = query.toLowerCase()
        filteredProviders = filteredProviders.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery) ||
            p.categories.some((c) => c.toLowerCase().includes(searchQuery)),
        )
      }

      if (rating) {
        filteredProviders = filteredProviders.filter((p) => p.rating >= rating)
      }

      // Paginación
      const paginatedProviders = filteredProviders.slice(offset, offset + limit)

      return NextResponse.json({
        providers: paginatedProviders,
        total: filteredProviders.length,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(filteredProviders.length / limit),
      })
    }

    // Implementación real con base de datos
    const whereClause: any = {}

    if (category) {
      whereClause.categories = {
        some: {
          id: category,
        },
      }
    }

    if (service) {
      whereClause.services = {
        some: {
          id: service,
        },
      }
    }

    if (rating) {
      whereClause.rating = {
        gte: rating,
      }
    }

    // Búsqueda por texto
    if (query) {
      whereClause.OR = [
        {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ]
    }

    // Obtener total sin paginación
    const total = await db.providerProfile.count({
      where: whereClause,
    })

    // Obtener proveedores con paginación
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
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            address: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        rating: "desc",
      },
    })

    // Formatear la respuesta
    const formattedProviders = providers.map((provider) => ({
      id: provider.id,
      userId: provider.userId,
      name: provider.user.name,
      email: provider.user.email,
      image: provider.user.image,
      description: provider.description,
      categories: provider.categories.map((c) => c.name),
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      verified: provider.verified,
      location: provider.location,
      services: provider.services.filter((s) => s.active),
      availability: {
        immediate: provider.immediateAvailability,
        nextAvailable: provider.nextAvailableDate,
      },
    }))

    return NextResponse.json({
      providers: formattedProviders,
      total,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error en /api/providers:", error)
    return NextResponse.json(
      { error: "Error al obtener proveedores", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

/**
 * POST /api/providers
 *
 * Crea o actualiza un perfil de proveedor para el usuario autenticado
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Verificar si el usuario ya tiene un perfil de proveedor
    let providerProfile = await db.providerProfile.findUnique({
      where: { userId: user.id },
    })

    // Crear o actualizar el perfil
    if (providerProfile) {
      // Actualizar perfil existente
      providerProfile = await db.providerProfile.update({
        where: { id: providerProfile.id },
        data: {
          description: data.description,
          title: data.title,
          phone: data.phone,
          verified: data.verified || false,
          immediateAvailability: data.immediateAvailability || false,
          nextAvailableDate: data.nextAvailableDate,
          // Otros campos que se puedan actualizar
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })
    } else {
      // Crear nuevo perfil
      providerProfile = await db.providerProfile.create({
        data: {
          userId: user.id,
          description: data.description || "",
          title: data.title || "",
          phone: data.phone || "",
          rating: 0,
          reviewCount: 0,
          verified: false,
          immediateAvailability: data.immediateAvailability || false,
          nextAvailableDate: data.nextAvailableDate,
          // Otros campos necesarios
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      providerProfile: {
        id: providerProfile.id,
        userId: providerProfile.userId,
        name: providerProfile.user.name,
        email: providerProfile.user.email,
        image: providerProfile.user.image,
        description: providerProfile.description,
        title: providerProfile.title,
        phone: providerProfile.phone,
        rating: providerProfile.rating,
        reviewCount: providerProfile.reviewCount,
        verified: providerProfile.verified,
        availability: {
          immediate: providerProfile.immediateAvailability,
          nextAvailable: providerProfile.nextAvailableDate,
        },
      },
    })
  } catch (error) {
    console.error("Error en POST /api/providers:", error)
    return NextResponse.json(
      {
        error: "Error al crear/actualizar perfil de proveedor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
