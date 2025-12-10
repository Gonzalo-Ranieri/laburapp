import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

async function setupNeonDatabase() {
  console.log("🚀 Configurando base de datos en Neon...")

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está configurada")
  }

  const sql = neon(databaseUrl)

  try {
    // Leer el script SQL
    const sqlScript = fs.readFileSync(path.join(process.cwd(), "scripts/setup-production-db.sql"), "utf8")

    console.log("📝 Ejecutando script de configuración...")

    // Dividir el script en comandos individuales
    const commands = sqlScript
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"))

    // Ejecutar cada comando
    for (const command of commands) {
      if (command.trim()) {
        try {
          await sql(command + ";")
        } catch (error: any) {
          // Ignorar errores de elementos que ya existen
          if (!error.message.includes("already exists")) {
            console.warn(`⚠️ Advertencia ejecutando comando: ${error.message}`)
          }
        }
      }
    }

    console.log("✅ Base de datos configurada exitosamente en Neon")

    // Verificar la configuración
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `

    console.log("📊 Tablas creadas:")
    tables.forEach((table: any) => {
      console.log(`  - ${table.table_name}`)
    })

    // Verificar datos iniciales
    const serviceTypes = await sql`SELECT COUNT(*) as count FROM "ServiceType"`
    console.log(`📋 Tipos de servicios insertados: ${serviceTypes[0].count}`)
  } catch (error) {
    console.error("❌ Error configurando la base de datos:", error)
    throw error
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupNeonDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { setupNeonDatabase }
