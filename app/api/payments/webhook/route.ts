import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getPaymentStatus } from "@/lib/mercadopago-config"

// POST: Recibir notificaciones de Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar tipo de notificación
    if (body.type !== "payment") {
      return NextResponse.json({ message: "Notificación recibida pero no procesada" })
    }

    // Obtener detalles del pago
    const paymentId = body.data.id
    const paymentInfo = await getPaymentStatus(paymentId)

    if (!paymentInfo) {
      return NextResponse.json({ error: "No se pudo obtener información del pago" }, { status: 400 })
    }

    // Buscar el pago en nuestra base de datos por external_reference
    const externalReference = paymentInfo.external_reference

    if (!externalReference) {
      return NextResponse.json({ error: "Referencia externa no encontrada" }, { status: 400 })
    }

    // Buscar el pago por metadata.externalReference
    const payment = await prisma.payment.findFirst({
      where: {
        metadata: {
          path: ["externalReference"],
          equals: externalReference,
        },
      },
      include: {
        request: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado en nuestra base de datos" }, { status: 404 })
    }

    // Actualizar estado del pago
    let status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELLED"

    switch (paymentInfo.status) {
      case "approved":
        status = "APPROVED"
        break
      case "rejected":
        status = "REJECTED"
        break
      case "refunded":
        status = "REFUNDED"
        break
      case "cancelled":
        status = "CANCELLED"
        break
      default:
        status = "PENDING"
    }

    // Actualizar pago en la base de datos
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        externalId: paymentId.toString(),
        paymentMethod: paymentInfo.payment_method_id,
        paymentType: paymentInfo.payment_type_id,
        metadata: {
          ...payment.metadata,
          paymentInfo: paymentInfo,
        },
        updatedAt: new Date(),
      },
    })

    // Si el pago fue aprobado, actualizar el estado de la solicitud
    if (status === "APPROVED" && payment.request.status !== "COMPLETED") {
      await prisma.serviceRequest.update({
        where: { id: payment.requestId },
        data: {
          status: "COMPLETED",
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar webhook de Mercado Pago:", error)
    return NextResponse.json({ error: "Error al procesar webhook" }, { status: 500 })
  }
}
