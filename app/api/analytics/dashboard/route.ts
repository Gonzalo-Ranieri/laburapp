import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener métricas del dashboard
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get("period") || "30" // días
    const role = url.searchParams.get("role") || "client"

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    let analytics: any = {}

    if (role === "provider") {
      // Verificar que el usuario es proveedor
      const provider = await prisma.provider.findUnique({
        where: { userId: user.id },
      })

      if (!provider) {
        return NextResponse.json({ error: "No eres un proveedor" }, { status: 403 })
      }

      // Métricas para proveedores
      const [
        totalRequests,
        completedRequests,
        pendingRequests,
        totalEarnings,
        averageRating,
        recentReviews,
        requestsByStatus,
        earningsByMonth,
        topServices,
      ] = await Promise.all([
        // Total de solicitudes
        prisma.serviceRequest.count({
          where: {
            providerId: user.id,
            createdAt: { gte: startDate },
          },
        }),

        // Solicitudes completadas
        prisma.serviceRequest.count({
          where: {
            providerId: user.id,
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
        }),

        // Solicitudes pendientes
        prisma.serviceRequest.count({
          where: {
            providerId: user.id,
            status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
          },
        }),

        // Ganancias totales
        prisma.payment.aggregate({
          where: {
            providerId: user.id,
            status: "APPROVED",
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),

        // Rating promedio
        prisma.review.aggregate({
          where: {
            providerId: user.id,
            createdAt: { gte: startDate },
          },
          _avg: { rating: true },
          _count: { rating: true },
        }),

        // Reseñas recientes
        prisma.review.findMany({
          where: {
            providerId: user.id,
          },
          include: {
            user: {
              select: { name: true, image: true },
            },
            request: {
              select: {
                serviceType: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        // Solicitudes por estado
        prisma.serviceRequest.groupBy({
          by: ["status"],
          where: {
            providerId: user.id,
            createdAt: { gte: startDate },
          },
          _count: { status: true },
        }),

        // Ganancias por mes
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            SUM(amount) as total
          FROM "Payment"
          WHERE "providerId" = ${user.id}
            AND status = 'APPROVED'
            AND "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
          LIMIT 6
        `,

        // Servicios más solicitados
        prisma.serviceRequest.groupBy({
          by: ["serviceTypeId"],
          where: {
            providerId: user.id,
            createdAt: { gte: startDate },
          },
          _count: { serviceTypeId: true },
          orderBy: { _count: { serviceTypeId: "desc" } },
          take: 5,
        }),
      ])

      // Obtener nombres de servicios
      const serviceTypeIds = topServices.map((s) => s.serviceTypeId)
      const serviceTypes = await prisma.serviceType.findMany({
        where: { id: { in: serviceTypeIds } },
        select: { id: true, name: true, icon: true },
      })

      const topServicesWithNames = topServices.map((service) => ({
        ...service,
        serviceType: serviceTypes.find((st) => st.id === service.serviceTypeId),
      }))

      analytics = {
        overview: {
          totalRequests,
          completedRequests,
          pendingRequests,
          totalEarnings: totalEarnings._sum.amount || 0,
          averageRating: averageRating._avg.rating || 0,
          totalReviews: averageRating._count.rating,
          completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
        },
        charts: {
          requestsByStatus: requestsByStatus.map((item) => ({
            status: item.status,
            count: item._count.status,
          })),
          earningsByMonth: earningsByMonth,
          topServices: topServicesWithNames,
        },
        recentActivity: {
          reviews: recentReviews,
        },
      }
    } else {
      // Métricas para clientes
      const [
        totalRequests,
        completedRequests,
        pendingRequests,
        totalSpent,
        favoriteProviders,
        recentRequests,
        requestsByStatus,
        spendingByMonth,
      ] = await Promise.all([
        // Total de solicitudes
        prisma.serviceRequest.count({
          where: {
            clientId: user.id,
            createdAt: { gte: startDate },
          },
        }),

        // Solicitudes completadas
        prisma.serviceRequest.count({
          where: {
            clientId: user.id,
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
        }),

        // Solicitudes pendientes
        prisma.serviceRequest.count({
          where: {
            clientId: user.id,
            status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
          },
        }),

        // Total gastado
        prisma.payment.aggregate({
          where: {
            userId: user.id,
            status: "APPROVED",
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),

        // Proveedores favoritos (más utilizados)
        prisma.serviceRequest.groupBy({
          by: ["providerId"],
          where: {
            clientId: user.id,
            providerId: { not: null },
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _count: { providerId: true },
          orderBy: { _count: { providerId: "desc" } },
          take: 5,
        }),

        // Solicitudes recientes
        prisma.serviceRequest.findMany({
          where: {
            clientId: user.id,
          },
          include: {
            provider: {
              select: { name: true, image: true },
            },
            serviceType: {
              select: { name: true, icon: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),

        // Solicitudes por estado
        prisma.serviceRequest.groupBy({
          by: ["status"],
          where: {
            clientId: user.id,
            createdAt: { gte: startDate },
          },
          _count: { status: true },
        }),

        // Gastos por mes
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            SUM(amount) as total
          FROM "Payment"
          WHERE "userId" = ${user.id}
            AND status = 'APPROVED'
            AND "createdAt" >= ${startDate}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
          LIMIT 6
        `,
      ])

      // Obtener información de proveedores favoritos
      const providerIds = favoriteProviders.map((fp) => fp.providerId).filter((id): id is string => id !== null)

      const providers = await prisma.user.findMany({
        where: { id: { in: providerIds } },
        select: {
          id: true,
          name: true,
          image: true,
          providerProfile: {
            select: { rating: true, reviewCount: true },
          },
        },
      })

      const favoriteProvidersWithInfo = favoriteProviders.map((fp) => ({
        ...fp,
        provider: providers.find((p) => p.id === fp.providerId),
      }))

      analytics = {
        overview: {
          totalRequests,
          completedRequests,
          pendingRequests,
          totalSpent: totalSpent._sum.amount || 0,
          averageRequestValue: totalRequests > 0 ? (totalSpent._sum.amount || 0) / totalRequests : 0,
          completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
        },
        charts: {
          requestsByStatus: requestsByStatus.map((item) => ({
            status: item.status,
            count: item._count.status,
          })),
          spendingByMonth: spendingByMonth,
          favoriteProviders: favoriteProvidersWithInfo,
        },
        recentActivity: {
          requests: recentRequests,
        },
      }
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error obteniendo analytics:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
