import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

// Función para calcular la distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distancia en km
  return distance
}

// GET: Obtener proveedores cercanos
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0")
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0")
    const serviceTypeId = searchParams.get("serviceTypeId")
    const radius = Number.parseFloat(searchParams.get("radius") || "10") // Radio en km, por defecto 10km

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitud y longitud son requeridos" }, { status: 400 })
    }

    // Construir la consulta base
    let query = `
      SELECT DISTINCT ON (p."userId") 
        p.*, 
        u.name, 
        u.email, 
        u.image, 
        u.phone, 
        st.name as "serviceName", 
        st.icon,
        pl.latitude,
        pl.longitude,
        pl.timestamp as "locationTimestamp"
      FROM "Provider" p
      JOIN "User" u ON p."userId" = u.id
      JOIN "ServiceType" st ON p."serviceTypeId" = st.id
      LEFT JOIN (
        SELECT DISTINCT ON ("userId") *
        FROM "ProviderLocation"
        ORDER BY "userId", "timestamp" DESC
      ) pl ON p."userId" = pl.userId
      WHERE p."isAvailable" = true
    `

    const params = []
    let paramIndex = 1

    if (serviceTypeId) {
      query += ` AND p."serviceTypeId" = $${paramIndex}`
      params.push(serviceTypeId)
      paramIndex++
    }

    query += ` ORDER BY p."userId", p."rating" DESC`

    // Ejecutar la consulta
    const providers = await sql.unsafe(query, params)

    // Filtrar y calcular distancia para cada proveedor
    const nearbyProviders = providers
      .filter((provider: any) => provider.latitude && provider.longitude) // Solo proveedores con ubicación
      .map((provider: any) => {
        const distance = calculateDistance(latitude, longitude, provider.latitude, provider.longitude)
        return {
          ...provider,
          distance,
        }
      })
      .filter((provider: any) => provider.distance <= radius) // Solo proveedores dentro del radio
      .sort((a: any, b: any) => a.distance - b.distance) // Ordenar por distancia

    return NextResponse.json(nearbyProviders)
  } catch (error) {
    console.error("Error al buscar proveedores cercanos:", error)
    return NextResponse.json({ error: "Error al buscar proveedores cercanos" }, { status: 500 })
  }
}
