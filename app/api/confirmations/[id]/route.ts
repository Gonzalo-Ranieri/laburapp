import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    const { confirmed } = body

    // Verificar que la confirmación exista
    const confirmation = await prisma.taskConfirmation.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            client: true,
            provider: true,
            payment: true,
          },
        },
      },
    })

    if (!confirmation) {
      return NextResponse.json({ error: "Confirmación no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario sea el cliente de la solicitud
    if (confirmation.request.clientId !== user.id) {
      return NextResponse.json({ error: "No autorizado para confirmar esta tarea" }, { status: 403 })
    }

    // Verificar que la confirmación no haya sido procesada ya
    if (confirmation.confirmed || confirmation.autoReleased) {
      return NextResponse.json({ error: "Esta confirmación ya ha sido procesada" }, { status: 400 })
    }

    // Actualizar la confirmación
    const updatedConfirmation = await prisma.taskConfirmation.update({
      where: { id },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
      },
    })

    // Si se confirma, liberar el pago al proveedor
    if (confirmed && confirmation.request.payment) {
      await prisma.payment.update({
        where: { id: confirmation.request.payment.id },
        data: {
          status: "APPROVED",
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json(updatedConfirmation)
  } catch (error) {
    console.error("Error al procesar confirmación:", error)
    return NextResponse.json({ error: "Error al procesar confirmación" }, { status: 500 })
  }
}
