import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// POST: Establecer precio de un servicio
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, price } = body

    if (!requestId || price === undefined || price <= 0) {
      return NextResponse.json({ error: "ID de solicitud y precio válido son requeridos" }, { status: 400 })
    }

    // Verificar que el usuario sea el proveedor del servicio
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (serviceRequest.providerId !== user.id) {
      return NextResponse.json({ error: "Solo el proveedor puede establecer el precio" }, { status: 403 })
    }

    // Actualizar precio
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { price },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Error al establecer precio:", error)
    return NextResponse.json({ error: "Error al establecer precio" }, { status: 500 })
  }
}
