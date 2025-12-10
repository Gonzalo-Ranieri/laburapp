import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener solicitud específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        provider: {
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
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
        tracking: {
          select: {
            id: true,
            status: true,
            latitude: true,
            longitude: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
        },
        confirmation: {
          select: {
            id: true,
            confirmed: true,
            confirmedAt: true,
            expiresAt: true,
            autoReleased: true,
          },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Verificar permisos
    const isClient = serviceRequest.clientId === user.id
    const isProvider = serviceRequest.providerId === user.id

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({ request: serviceRequest })
  } catch (error) {
    console.error("Error obteniendo solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar solicitud
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { status, providerId, price, scheduledDate } = body

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        provider: true,
        client: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Verificar permisos según la acción
    const isClient = serviceRequest.clientId === user.id
    const isProvider = serviceRequest.providerId === user.id

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Validar transiciones de estado
    const validTransitions: Record<string, string[]> = {
      PENDING: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (status && !validTransitions[serviceRequest.status].includes(status)) {
      return NextResponse.json({ error: "Transición de estado no válida" }, { status: 400 })
    }

    // Validar permisos específicos por acción
    if (status === "ACCEPTED" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede aceptar solicitudes" }, { status: 403 })
    }

    if (status === "IN_PROGRESS" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede iniciar el servicio" }, { status: 403 })
    }

    if (status === "COMPLETED" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede completar el servicio" }, { status: 403 })
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (status) updateData.status = status
    if (providerId && isClient && serviceRequest.status === "PENDING") {
      updateData.providerId = providerId
    }
    if (price && isProvider && serviceRequest.status === "ACCEPTED") {
      updateData.price = Number.parseFloat(price)
    }
    if (scheduledDate && (isClient || isProvider)) {
      updateData.scheduledDate = new Date(scheduledDate)
    }

    // Actualizar en transacción
    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          provider: {
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
            },
          },
        },
      })

      // Si se completa el servicio, crear confirmación automática
      if (status === "COMPLETED") {
        await tx.taskConfirmation.create({
          data: {
            requestId: params.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          },
        })
      }

      return updatedRequest
    })

    return NextResponse.json({ request: result })
  } catch (error) {
    console.error("Error actualizando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Cancelar solicitud
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: params.id },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Solo el cliente puede cancelar
    if (serviceRequest.clientId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Solo se puede cancelar si no está completada
    if (serviceRequest.status === "COMPLETED") {
      return NextResponse.json({ error: "No se puede cancelar un servicio completado" }, { status: 400 })
    }

    // Actualizar estado a cancelado
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error("Error cancelando solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
