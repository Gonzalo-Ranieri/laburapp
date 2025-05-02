import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// GET: Verificar un pago por referencia externa
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const externalReference = searchParams.get("externalReference")

    if (!externalReference) {
      return NextResponse.json({ error: "Referencia externa es requerida" }, { status: 400 })
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
        request: {
          include: {
            serviceType: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    if (payment.userId !== user.id && payment.providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para ver este pago" }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error al verificar pago:", error)
    return NextResponse.json({ error: "Error al verificar pago" }, { status: 500 })
  }
}
