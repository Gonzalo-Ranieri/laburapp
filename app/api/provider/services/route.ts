import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener servicios del proveedor
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscar el proveedor del usuario
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    })

    if (!provider) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    // Obtener servicios del proveedor
    const services = await prisma.providerService.findMany({
      where: { providerId: provider.id },
      include: {
        serviceType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error obteniendo servicios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear nuevo servicio
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Buscar el proveedor del usuario
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    })

    if (!provider) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      serviceTypeId,
      price,
      priceType = "FIXED",
      duration,
      subcategory,
      tags = [],
      requirements,
      images = [],
    } = body

    // Validaciones
    if (!name || !description || !serviceTypeId || !price) {
      return NextResponse.json({ error: "Campos requeridos: name, description, serviceTypeId, price" }, { status: 400 })
    }

    if (price <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    // Verificar que el tipo de servicio existe
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId },
    })

    if (!serviceType) {
      return NextResponse.json({ error: "Tipo de servicio no válido" }, { status: 400 })
    }

    // Crear el servicio
    const service = await prisma.providerService.create({
      data: {
        providerId: provider.id,
        serviceTypeId,
        name,
        description,
        price: Number.parseFloat(price),
        priceType,
        duration: duration ? Number.parseInt(duration) : null,
        subcategory: subcategory || null,
        tags: Array.isArray(tags) ? tags : [],
        requirements: requirements || null,
        images: Array.isArray(images) ? images : [],
        isActive: true,
      },
      include: {
        serviceType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error("Error creando servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
