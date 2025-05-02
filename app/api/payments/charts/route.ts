import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener datos para gráficos de pagos
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
      return NextResponse.json({ error: "No autorizado para ver estos datos" }, { status: 403 })
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
    let groupBy: "day" | "month" | "year"
    let format: (date: Date) => string

    switch (period) {
      case "week":
        // Últimos 7 días
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6)
        groupBy = "day"
        format = (date) => date.toLocaleDateString("es-ES", { weekday: "short" })
        break
      case "month":
        // Últimos 30 días
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 29)
        groupBy = "day"
        format = (date) => date.getDate().toString()
        break
      case "year":
        // Últimos 12 meses
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 11)
        groupBy = "month"
        format = (date) => date.toLocaleDateString("es-ES", { month: "short" })
        break
      default:
        // Por defecto, últimos 30 días
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 29)
        groupBy = "day"
        format = (date) => date.getDate().toString()
    }

    // Obtener pagos aprobados en el período
    const payments = await prisma.payment.findMany({
      where: {
        ...whereClause,
        status: "APPROVED",
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Agrupar pagos por período
    const groupedData: Record<string, { amount: number; count: number; date: Date }> = {}

    // Generar todas las fechas del período
    const allDates: Date[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= now) {
      const dateKey =
        groupBy === "day"
          ? `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
          : `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`

      groupedData[dateKey] = {
        amount: 0,
        count: 0,
        date: new Date(currentDate),
      }

      allDates.push(new Date(currentDate))

      if (groupBy === "day") {
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (groupBy === "month") {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else {
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      }
    }

    // Sumar pagos por fecha
    payments.forEach((payment) => {
      const date = new Date(payment.createdAt)
      const dateKey =
        groupBy === "day"
          ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          : `${date.getFullYear()}-${date.getMonth() + 1}`

      if (groupedData[dateKey]) {
        groupedData[dateKey].amount += payment.amount
        groupedData[dateKey].count += 1
      }
    })

    // Convertir a array para el gráfico
    const chartData = Object.values(groupedData).map((item) => ({
      label: format(item.date),
      amount: item.amount,
      count: item.count,
    }))

    // Calcular totales
    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0)
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0)
    const maxAmount = Math.max(...chartData.map((item) => item.amount), 1) // Evitar división por cero

    return NextResponse.json({
      data: chartData,
      totalAmount,
      totalCount,
      maxAmount,
      period,
    })
  } catch (error) {
    console.error("Error al obtener datos para gráficos:", error)
    return NextResponse.json({ error: "Error al obtener datos para gráficos" }, { status: 500 })
  }
}
