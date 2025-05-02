import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Obtener historial de pagos
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
      return NextResponse.json({ error: "No autorizado para ver estos pagos" }, { status: 403 })
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

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        request: {
          include: {
            serviceType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error)
    return NextResponse.json({ error: "Error al obtener historial de pagos" }, { status: 500 })
  }
}
