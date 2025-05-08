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
      return NextResponse.json({ error: "No autorizado para ver estos pagos" }, { status: 403 })
    }

    // Obtener pagos en estado ESCROW para el proveedor
    const escrowPayments = await prisma.payment.findMany({
      where: {
        providerId: providerId,
        status: "ESCROW",
        request: {
          // Solo incluir pagos de servicios en progreso o completados sin confirmación
          OR: [
            { status: "IN_PROGRESS" },
            {
              status: "COMPLETED",
              confirmation: null,
            },
          ],
        },
      },
      include: {
        request: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            serviceType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(escrowPayments)
  } catch (error) {
    console.error("Error al obtener pagos en escrow:", error)
    return NextResponse.json({ error: "Error al obtener pagos en escrow" }, { status: 500 })
  }
}
