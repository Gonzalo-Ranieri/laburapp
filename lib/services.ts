import { sql } from "./db"

export async function getServiceTypes() {
  try {
    const serviceTypes = await sql`SELECT * FROM "ServiceType" ORDER BY "name"`
    return serviceTypes
  } catch (error) {
    console.error("Error fetching service types:", error)
    return []
  }
}

export async function getProvidersByServiceType(serviceTypeId: string) {
  try {
    const providers = await sql`
      SELECT p.*, u.name, u.image, u.phone, st.name as "serviceName", st.icon
      FROM "Provider" p
      JOIN "User" u ON p."userId" = u.id
      JOIN "ServiceType" st ON p."serviceTypeId" = st.id
      WHERE p."serviceTypeId" = ${serviceTypeId}
      AND p."isAvailable" = true
      ORDER BY p."rating" DESC
    `
    return providers
  } catch (error) {
    console.error("Error fetching providers:", error)
    return []
  }
}
