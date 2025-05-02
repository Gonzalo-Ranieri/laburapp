import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// POST: Actualizar el seguimiento de un servicio
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, latitude, longitude, status } = body

    if (!requestId || !latitude || !longitude || !status) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar que el usuario sea el proveedor del servicio
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (serviceRequest.providerId !== user.id) {
      return NextResponse.json({ error: "Solo el proveedor puede actualizar el seguimiento" }, { status: 403 })
    }

    // Crear registro de seguimiento
    const tracking = await prisma.serviceTracking.create({
      data: {
        requestId,
        latitude,
        longitude,
        status: status as any,
      },
    })

    return NextResponse.json(tracking, { status: 201 })
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error)
    return NextResponse.json({ error: "Error al actualizar seguimiento" }, { status: 500 })
  }
}

// GET: Obtener el seguimiento de un servicio
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ error: "ID de solicitud es requerido" }, { status: 400 })
    }

    // Verificar que el usuario sea el cliente o el proveedor del servicio
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
    }

    if (serviceRequest.clientId !== user.id && serviceRequest.providerId !== user.id) {
      return NextResponse.json({ error: "No autorizado para ver este seguimiento" }, { status: 403 })
    }

    // Obtener registros de seguimiento
    const tracking = await prisma.serviceTracking.findMany({
      where: { requestId },
      orderBy: { timestamp: "desc" },
    })

    return NextResponse.json(tracking)
  } catch (error) {
    console.error("Error al obtener seguimiento:", error)
    return NextResponse.json({ error: "Error al obtener seguimiento" }, { status: 500 })
  }
}
