import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { createPaymentPreference } from "@/lib/mercadopago-config"
import { v4 as uuidv4 } from "uuid"

// POST: Crear un nuevo pago
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
        serviceType: true,
        payment: true,
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (serviceRequest.clientId !== user.id) {
      return NextResponse.json({ error: "No autorizado para realizar este pago" }, { status: 403 })
    }

    if (serviceRequest.payment) {
      return NextResponse.json({ error: "Ya existe un pago para esta solicitud" }, { status: 400 })
    }

    if (!serviceRequest.providerId) {
      return NextResponse.json({ error: "La solicitud no tiene un proveedor asignado" }, { status: 400 })
    }

    if (!serviceRequest.price) {
      return NextResponse.json({ error: "La solicitud no tiene un precio definido" }, { status: 400 })
    }

    // Crear referencia externa única
    const externalReference = uuidv4()

    // Crear preferencia de pago en Mercado Pago
    const preference = await createPaymentPreference({
      items: [
        {
          id: serviceRequest.id,
          title: `Servicio de ${serviceRequest.serviceType.name}`,
          description: serviceRequest.description.substring(0, 255),
          quantity: 1,
          unitPrice: serviceRequest.price,
        },
      ],
      payer: {
        name: serviceRequest.client.name,
        email: serviceRequest.client.email,
      },
      externalReference,
    })

    // Guardar información del pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        requestId: serviceRequest.id,
        userId: user.id,
        providerId: serviceRequest.providerId,
        amount: serviceRequest.price,
        preferenceId: preference.id,
        description: `Pago por servicio de ${serviceRequest.serviceType.name}`,
        metadata: {
          preferenceId: preference.id,
          externalReference,
        },
      },
    })

    return NextResponse.json({
      payment,
      checkoutUrl: preference.init_point,
    })
  } catch (error) {
    console.error("Error al crear pago:", error)
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 })
  }
}

// GET: Obtener información de un pago
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "ID de solicitud es requerido" }, { status: 400 })
    }

    // Verificar que el pago exista y pertenezca al usuario
    const payment = await prisma.payment.findUnique({
      where: { requestId },
      include: {
        request: {
          include: {
            serviceType: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    if (payment.userId !== user.id && payment.providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para ver este pago" }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error al obtener pago:", error)
    return NextResponse.json({ error: "Error al obtener pago" }, { status: 500 })
  }
}
