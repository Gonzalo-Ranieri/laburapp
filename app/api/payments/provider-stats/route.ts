import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const providerId = url.searchParams.get("providerId")

    // Verificar que el usuario sea el proveedor solicitado
    if (providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para ver estas estadísticas" }, { status: 403 })
    }

    // Obtener pagos liberados (APPROVED)
    const releasedPayments = await prisma.payment.findMany({
      where: {
        providerId: providerId,
        status: "APPROVED",
      },
    })

    // Obtener pagos en escrow
    const escrowPayments = await prisma.payment.findMany({
      where: {
        providerId: providerId,
        status: "ESCROW",
        request: {
          confirmation: null,
        },
      },
    })

    // Obtener pagos pendientes de confirmación
    const pendingConfirmationPayments = await prisma.payment.findMany({
      where: {
        providerId: providerId,
        status: "ESCROW",
        request: {
          confirmation: {
            confirmed: false,
            autoReleased: false,
          },
        },
      },
    })

    // Calcular totales
    const releasedAmount = releasedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const escrowAmount = escrowPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const pendingConfirmationAmount = pendingConfirmationPayments.reduce((sum, payment) => sum + payment.amount, 0)

    const stats = {
      releasedCount: releasedPayments.length,
      releasedAmount,
      escrowCount: escrowPayments.length,
      escrowAmount,
      pendingConfirmationCount: pendingConfirmationPayments.length,
      pendingConfirmationAmount,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
