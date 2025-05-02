import { neon, neonConfig } from "@neondatabase/serverless"
import { prisma } from "../prisma/client"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Create SQL client
export const sql = neon(process.env.DATABASE_URL!)

export { prisma }
export default prisma
