import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener una solicitud específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        serviceType: true,
        review: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario sea el cliente o el proveedor
    if (serviceRequest.clientId !== user.id && serviceRequest.providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error("Error al obtener solicitud:", error)
    return NextResponse.json({ error: "Error al obtener solicitud" }, { status: 500 })
  }
}

// PATCH: Actualizar el estado de una solicitud
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { status, price } = body

    // Obtener la solicitud actual
    const currentRequest = await prisma.serviceRequest.findUnique({
      where: { id },
    })

    if (!currentRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Verificar permisos según la acción
    const isClient = currentRequest.clientId === user.id
    const isProvider = currentRequest.providerId === user.id

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Validar transiciones de estado permitidas
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (status && currentRequest.status !== status && !allowedTransitions[currentRequest.status].includes(status)) {
      return NextResponse.json({ error: "Transición de estado no permitida" }, { status: 400 })
    }

    // Verificar permisos específicos por estado
    if (status === "ACCEPTED" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede aceptar solicitudes" }, { status: 403 })
    }

    if (status === "IN_PROGRESS" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede iniciar el servicio" }, { status: 403 })
    }

    if (status === "COMPLETED" && !isProvider) {
      return NextResponse.json({ error: "Solo el proveedor puede completar el servicio" }, { status: 403 })
    }

    // Actualizar solicitud
    const updateData: any = {}
    if (status) updateData.status = status
    if (price !== undefined && isProvider) updateData.price = price

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        serviceType: true,
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Error al actualizar solicitud:", error)
    return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
  }
}
