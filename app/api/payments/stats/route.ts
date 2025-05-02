import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener estadísticas de pagos
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const providerId = searchParams.get("providerId")
    const period = searchParams.get("period") || "month"

    // Verificar permisos
    if ((userId && userId !== user.id) || (providerId && providerId !== user.id)) {
      return NextResponse.json({ error: "No autorizado para ver estas estadísticas" }, { status: 403 })
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

    // Calcular fechas para el período
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case "week":
        // Esta semana
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        // Semana anterior
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        previousEndDate.setDate(previousEndDate.getDate() - 1)
        break
      case "month":
        // Este mes
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        // Mes anterior
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "year":
        // Este año
        startDate = new Date(now.getFullYear(), 0, 1)
        // Año anterior
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        // Todo el tiempo (sin filtro de fecha)
        startDate = new Date(0)
        previousStartDate = new Date(0)
        previousEndDate = new Date(0)
    }

    // Obtener pagos del período actual
    const currentPeriodPayments = await prisma.payment.findMany({
      where: {
        ...whereClause,
        status: "APPROVED",
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Obtener pagos del período anterior
    const previousPeriodPayments = await prisma.payment.findMany({
      where: {
        ...whereClause,
        status: "APPROVED",
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    })

    // Calcular totales
    const currentPeriodAmount = currentPeriodPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const previousPeriodAmount = previousPeriodPayments.reduce((sum, payment) => sum + payment.amount, 0)

    // Calcular cambios porcentuales
    const monthlyChange =
      previousPeriodAmount === 0 ? 100 : ((currentPeriodAmount - previousPeriodAmount) / previousPeriodAmount) * 100

    const completedChange =
      previousPeriodPayments.length === 0
        ? 100
        : ((currentPeriodPayments.length - previousPeriodPayments.length) / previousPeriodPayments.length) * 100

    // Construir estadísticas
    const stats = {
      currentPeriodAmount,
      previousPeriodAmount,
      monthlyChange,
      completedCount: currentPeriodPayments.length,
      previousCompletedCount: previousPeriodPayments.length,
      completedChange,
      period,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error al obtener estadísticas de pagos:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas de pagos" }, { status: 500 })
  }
}
