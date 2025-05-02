import { neon, neonConfig } from "@neondatabase/serverless"
import { PrismaClient } from "@prisma/client"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Create SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Create Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
