import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener recomendaciones personalizadas
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get("type") || "providers" // providers, services
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    let recommendations: any = {}

    if (type === "providers") {
      // Obtener historial del usuario para recomendaciones
      const userHistory = await prisma.serviceRequest.findMany({
        where: { clientId: user.id },
        include: {
          serviceType: true,
          provider: {
            include: {
              user: true,
              serviceType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })

      // Extraer tipos de servicios más utilizados
      const serviceTypeFrequency = userHistory.reduce(
        (acc, request) => {
          const typeId = request.serviceTypeId
          acc[typeId] = (acc[typeId] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topServiceTypes = Object.entries(serviceTypeFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([typeId]) => typeId)

      // Obtener proveedores recomendados basados en:
      // 1. Tipos de servicios preferidos
      // 2. Rating alto
      // 3. Disponibilidad
      // 4. Que no hayan trabajado recientemente con el usuario
      const usedProviderIds = userHistory.map((r) => r.providerId).filter((id): id is string => id !== null)

      const recommendedProviders = await prisma.provider.findMany({
        where: {
          AND: [
            { serviceTypeId: { in: topServiceTypes.length > 0 ? topServiceTypes : undefined } },
            { rating: { gte: 4.0 } },
            { isAvailable: true },
            { userId: { notIn: usedProviderIds } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              phone: true,
            },
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
              priceType: true,
            },
            where: { isActive: true },
            take: 3,
          },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        take: limit,
      })

      // Obtener proveedores similares a los que ya usó
      const similarProviders = await prisma.provider.findMany({
        where: {
          AND: [
            { serviceTypeId: { in: topServiceTypes.length > 0 ? topServiceTypes : undefined } },
            { rating: { gte: 3.5 } },
            { isAvailable: true },
            { userId: { notIn: usedProviderIds } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              phone: true,
            },
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
              priceType: true,
            },
            where: { isActive: true },
            take: 3,
          },
        },
        orderBy: { reviewCount: "desc" },
        take: Math.floor(limit / 2),
      })

      recommendations = {
        newProviders: recommendedProviders,
        similarProviders: similarProviders,
        basedOn: {
          topServiceTypes: await prisma.serviceType.findMany({
            where: { id: { in: topServiceTypes } },
            select: { id: true, name: true, icon: true },
          }),
          totalRequests: userHistory.length,
        },
      }
    } else if (type === "services") {
      // Recomendaciones de servicios basadas en:
      // 1. Servicios populares en la zona
      // 2. Servicios de temporada
      // 3. Servicios complementarios

      const [popularServices, seasonalServices, trendingServices] = await Promise.all([
        // Servicios más populares
        prisma.serviceRequest.groupBy({
          by: ["serviceTypeId"],
          _count: { serviceTypeId: true },
          orderBy: { _count: { serviceTypeId: "desc" } },
          take: 5,
        }),

        // Servicios de temporada (simulado)
        prisma.serviceType.findMany({
          where: {
            name: {
              in: ["Limpieza", "Jardinería", "Climatización"], // Servicios estacionales
            },
          },
          take: 3,
        }),

        // Servicios en tendencia (más solicitados recientemente)
        prisma.serviceRequest.groupBy({
          by: ["serviceTypeId"],
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
            },
          },
          _count: { serviceTypeId: true },
          orderBy: { _count: { serviceTypeId: "desc" } },
          take: 5,
        }),
      ])

      // Obtener información completa de los servicios
      const allServiceTypeIds = [
        ...popularServices.map((s) => s.serviceTypeId),
        ...seasonalServices.map((s) => s.id),
        ...trendingServices.map((s) => s.serviceTypeId),
      ]

      const serviceTypesInfo = await prisma.serviceType.findMany({
        where: { id: { in: allServiceTypeIds } },
        include: {
          _count: {
            select: {
              providers: true,
              requests: true,
            },
          },
        },
      })

      recommendations = {
        popular: popularServices.map((ps) => ({
          ...ps,
          serviceType: serviceTypesInfo.find((st) => st.id === ps.serviceTypeId),
        })),
        seasonal: seasonalServices.map((ss) => ({
          serviceType: ss,
          reason: "Servicio de temporada",
        })),
        trending: trendingServices.map((ts) => ({
          ...ts,
          serviceType: serviceTypesInfo.find((st) => st.id === ts.serviceTypeId),
          reason: "En tendencia esta semana",
        })),
      }
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error obteniendo recomendaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
