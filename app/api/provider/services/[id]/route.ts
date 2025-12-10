import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener servicio específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const service = await prisma.providerService.findUnique({
      where: { id: params.id },
      include: {
        serviceType: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        provider: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Verificar que el servicio pertenece al usuario
    if (service.provider.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error obteniendo servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar servicio
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.providerService.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    if (existingService.provider.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      serviceTypeId,
      price,
      priceType,
      duration,
      subcategory,
      tags,
      requirements,
      images,
      isActive,
    } = body

    // Validaciones
    if (price && price <= 0) {
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    }

    // Verificar tipo de servicio si se está actualizando
    if (serviceTypeId) {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: serviceTypeId },
      })

      if (!serviceType) {
        return NextResponse.json({ error: "Tipo de servicio no válido" }, { status: 400 })
      }
    }

    // Actualizar el servicio
    const service = await prisma.providerService.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(serviceTypeId && { serviceTypeId }),
        ...(price && { price: Number.parseFloat(price) }),
        ...(priceType && { priceType }),
        ...(duration !== undefined && { duration: duration ? Number.parseInt(duration) : null }),
        ...(subcategory !== undefined && { subcategory: subcategory || null }),
        ...(tags && { tags: Array.isArray(tags) ? tags : [] }),
        ...(requirements !== undefined && { requirements: requirements || null }),
        ...(images && { images: Array.isArray(images) ? images : [] }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
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

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error actualizando servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar servicio
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.providerService.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    if (existingService.provider.userId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar el servicio
    await prisma.providerService.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Servicio eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
