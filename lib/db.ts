import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Configurar neon para usar el polyfill de fetch
neonConfig.fetchConnectionCache = true

// Verificar que la URL de la base de datos esté definida
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL no está definida en las variables de entorno")
}

// Crear cliente SQL
export const sql = neon(databaseUrl || "")

// Crear pool de conexiones para consultas más complejas
let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
  }
  return pool
}

// Función auxiliar para ejecutar consultas SQL
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Intentar con el cliente neon primero
    try {
      const result = await sql(query, params)
      return result
    } catch (neonError) {
      console.warn("Error con cliente neon, intentando con pool:", neonError)

      // Si falla, intentar con el pool
      const poolClient = await getPool().connect()
      try {
        const result = await poolClient.query(query, params)
        return result.rows
      } finally {
        poolClient.release()
      }
    }
  } catch (error) {
    console.error("Error ejecutando consulta:", error)
    throw new Error(`Error de base de datos: ${error instanceof Error ? error.message : "Desconocido"}`)
  }
}

// Crear objeto db para exportar
export const db = {
  sql,
  executeQuery,
  getPool,
}

export default { sql, executeQuery, getPool }
