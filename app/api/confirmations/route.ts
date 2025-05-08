import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { addDays } from "date-fns"

// El período de confirmación en días (48 horas = 2 días)
const CONFIRMATION_PERIOD_DAYS = 2

// POST: Solicitar confirmación de una tarea completada
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json({ error: "ID de solicitud es requerido" }, { status: 400 })
    }

    // Verificar que la solicitud exista y pertenezca al usuario
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: true,
        provider: true,
        payment: true,
        confirmation: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario sea el proveedor del servicio
    if (serviceRequest.providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para solicitar confirmación" }, { status: 403 })
    }

    // Verificar que la solicitud esté en progreso
    if (serviceRequest.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Solo se pueden solicitar confirmaciones para servicios en progreso" },
        { status: 400 },
      )
    }

    // Verificar que exista un pago en estado ESCROW
    if (!serviceRequest.payment || serviceRequest.payment.status !== "ESCROW") {
      return NextResponse.json({ error: "No hay pago en estado de retención para esta solicitud" }, { status: 400 })
    }

    // Verificar si ya existe una confirmación
    if (serviceRequest.confirmation) {
      return NextResponse.json({ error: "Ya existe una solicitud de confirmación para este servicio" }, { status: 400 })
    }

    // Calcular fecha de expiración (2 días desde ahora)
    const expiresAt = addDays(new Date(), CONFIRMATION_PERIOD_DAYS)

    // Crear solicitud de confirmación
    const confirmation = await prisma.taskConfirmation.create({
      data: {
        requestId: serviceRequest.id,
        expiresAt,
      },
    })

    // Actualizar el estado de la solicitud a "COMPLETED" (esperando confirmación)
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    })

    // Aquí se enviaría una notificación al cliente (implementación futura)

    return NextResponse.json({
      confirmation,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Error al solicitar confirmación:", error)
    return NextResponse.json({ error: "Error al solicitar confirmación" }, { status: 500 })
  }
}

// GET: Obtener confirmaciones pendientes para un usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener confirmaciones pendientes donde el usuario es el cliente
    const pendingConfirmations = await prisma.taskConfirmation.findMany({
      where: {
        confirmed: false,
        autoReleased: false,
        request: {
          clientId: user.id,
        },
      },
      include: {
        request: {
          include: {
            serviceType: true,
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            payment: true,
          },
        },
      },
    })

    return NextResponse.json(pendingConfirmations)
  } catch (error) {
    console.error("Error al obtener confirmaciones pendientes:", error)
    return NextResponse.json({ error: "Error al obtener confirmaciones pendientes" }, { status: 500 })
  }
}
