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
      return NextResponse.json({ error: "No autorizado para ver estas confirmaciones" }, { status: 403 })
    }

    // Obtener confirmaciones pendientes donde el usuario es el proveedor
    const pendingConfirmations = await prisma.taskConfirmation.findMany({
      where: {
        confirmed: false,
        autoReleased: false,
        request: {
          providerId: providerId,
          status: "COMPLETED",
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
            payment: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(pendingConfirmations)
  } catch (error) {
    console.error("Error al obtener confirmaciones pendientes:", error)
    return NextResponse.json({ error: "Error al obtener confirmaciones pendientes" }, { status: 500 })
  }
}
