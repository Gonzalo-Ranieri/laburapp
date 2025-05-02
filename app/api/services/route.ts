import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sql } from "@/lib/db"

// GET: Obtener todos los tipos de servicios
export async function GET() {
  try {
    const serviceTypes = await sql`SELECT * FROM "ServiceType" ORDER BY "name"`
    return NextResponse.json(serviceTypes)
  } catch (error) {
    console.error("Error fetching service types:", error)
    return NextResponse.json({ error: "Error fetching service types" }, { status: 500 })
  }
}

// POST: Crear un nuevo tipo de servicio (solo admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, icon, description } = body

    if (!name || !icon) {
      return NextResponse.json({ error: "Nombre e icono son requeridos" }, { status: 400 })
    }

    const service = await prisma.serviceType.create({
      data: {
        name,
        icon,
        description,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error al crear servicio:", error)
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 })
  }
}
