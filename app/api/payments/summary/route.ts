import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener resumen de pagos
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const providerId = searchParams.get("providerId")

    // Verificar permisos
    if ((userId && userId !== user.id) || (providerId && providerId !== user.id)) {
      return NextResponse.json({ error: "No autorizado para ver este resumen" }, { status: 403 })
    }

    // Construir consulta
    const whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    } else if (providerId) {
      whereClause.providerId = providerId
    } else {
      // Si no se especifica, mostrar todos los pagos del usuario (como cliente o proveedor)
      whereClause.OR = [{ userId: user.id }, { providerId: user.id }]
    }

    // Obtener pagos completados
    const completedPayments = await prisma.payment.findMany({
      where: {
        ...whereClause,
        status: "APPROVED",
      },
    })

    // Obtener pagos pendientes
    const pendingPayments = await prisma.payment.findMany({
      where: {
        ...whereClause,
        status: "PENDING",
      },
    })

    // Calcular totales
    const totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)

    // Construir resumen
    const summary = {
      totalAmount,
      pendingAmount,
      completedCount: completedPayments.length,
      pendingCount: pendingPayments.length,
      totalCount: completedPayments.length + pendingPayments.length,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error al obtener resumen de pagos:", error)
    return NextResponse.json({ error: "Error al obtener resumen de pagos" }, { status: 500 })
  }
}
