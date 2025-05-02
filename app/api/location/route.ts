import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// POST: Actualizar la ubicación del proveedor
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude, accuracy } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitud y longitud son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario es un proveedor
    const provider = await sql`
      SELECT * FROM "Provider" WHERE "userId" = ${user.id} LIMIT 1
    `

    if (provider.length === 0) {
      return NextResponse.json({ error: "Solo los proveedores pueden actualizar su ubicación" }, { status: 403 })
    }

    // Guardar la ubicación
    const now = new Date()
    const locationId = await sql`
      INSERT INTO "ProviderLocation" ("id", "userId", "latitude", "longitude", "accuracy", "timestamp")
      VALUES (gen_random_uuid(), ${user.id}, ${latitude}, ${longitude}, ${accuracy || null}, ${now})
      RETURNING "id"
    `

    return NextResponse.json({ success: true, id: locationId[0].id })
  } catch (error) {
    console.error("Error al actualizar ubicación:", error)
    return NextResponse.json({ error: "Error al actualizar ubicación" }, { status: 500 })
  }
}

// GET: Obtener la ubicación de un proveedor
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")

    if (!providerId) {
      return NextResponse.json({ error: "ID del proveedor es requerido" }, { status: 400 })
    }

    // Obtener la ubicación más reciente del proveedor
    const location = await sql`
      SELECT * FROM "ProviderLocation"
      WHERE "userId" = ${providerId}
      ORDER BY "timestamp" DESC
      LIMIT 1
    `

    if (location.length === 0) {
      return NextResponse.json({ error: "No se encontró ubicación para este proveedor" }, { status: 404 })
    }

    return NextResponse.json(location[0])
  } catch (error) {
    console.error("Error al obtener ubicación:", error)
    return NextResponse.json({ error: "Error al obtener ubicación" }, { status: 500 })
  }
}
