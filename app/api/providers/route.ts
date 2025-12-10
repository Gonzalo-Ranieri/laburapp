import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener proveedores
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const serviceTypeId = url.searchParams.get("serviceTypeId") || ""
    const minRating = Number.parseFloat(url.searchParams.get("minRating") || "0")
    const isAvailable = url.searchParams.get("isAvailable")
    const latitude = url.searchParams.get("latitude")
    const longitude = url.searchParams.get("longitude")
    const radius = Number.parseFloat(url.searchParams.get("radius") || "10") // km

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
        { serviceType: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (serviceTypeId) {
      where.serviceTypeId = serviceTypeId
    }

    if (minRating > 0) {
      where.rating = { gte: minRating }
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === "true"
    }

    // Obtener proveedores
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
            take: 3, // Solo mostrar los primeros 3 servicios
          },
          _count: {
            select: {
              services: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
      }),
      prisma.provider.count({ where }),
    ])

    // Si se proporcionan coordenadas, calcular distancia
    let providersWithDistance = providers
    if (latitude && longitude) {
      // Aquí podrías implementar cálculo de distancia real
      // Por ahora, simulamos distancias aleatorias
      providersWithDistance = providers.map((provider) => ({
        ...provider,
        distance: Math.round(Math.random() * radius * 100) / 100, // Distancia simulada
      }))

      // Ordenar por distancia si se especifica ubicación
      providersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return NextResponse.json({
      providers: providersWithDistance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo proveedores:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear perfil de proveedor
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si ya tiene perfil de proveedor
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: user.id },
    })

    if (existingProvider) {
      return NextResponse.json({ error: "Ya tienes un perfil de proveedor" }, { status: 400 })
    }

    const body = await request.json()
    const { bio, serviceTypeId, price } = body

    // Validaciones
    if (!serviceTypeId) {
      return NextResponse.json({ error: "Tipo de servicio es requerido" }, { status: 400 })
    }

    // Verificar que el tipo de servicio existe
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId },
    })

    if (!serviceType) {
      return NextResponse.json({ error: "Tipo de servicio no válido" }, { status: 400 })
    }

    // Crear perfil de proveedor
    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        bio: bio || null,
        serviceTypeId,
        price: price || "$",
        rating: 0,
        reviewCount: 0,
        isAvailable: true,
      },
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
      },
    })

    return NextResponse.json({ provider }, { status: 201 })
  } catch (error) {
    console.error("Error creando proveedor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
