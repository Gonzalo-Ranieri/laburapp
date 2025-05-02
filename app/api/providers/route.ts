import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceTypeId = searchParams.get("serviceTypeId")

    let query = `
      SELECT p.*, u.name, u.email, u.image, u.phone, st.name as "serviceName", st.icon
      FROM "Provider" p
      JOIN "User" u ON p."userId" = u.id
      JOIN "ServiceType" st ON p."serviceTypeId" = st.id
      WHERE p."isAvailable" = true
    `

    const params = []

    if (serviceTypeId) {
      query += ` AND p."serviceTypeId" = $1`
      params.push(serviceTypeId)
    }

    query += ` ORDER BY p."rating" DESC`

    const providers = await sql.unsafe(query, params)

    return NextResponse.json(providers)
  } catch (error) {
    console.error("Error fetching providers:", error)
    return NextResponse.json({ error: "Error fetching providers" }, { status: 500 })
  }
}
