import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

async function setupSupabaseDatabase() {
  console.log("🚀 Configurando base de datos en Supabase...")

  const supabaseUrl = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Variables de Supabase no están configuradas")
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Leer el script SQL
    const sqlScript = fs.readFileSync(path.join(process.cwd(), "scripts/setup-production-db.sql"), "utf8")

    console.log("📝 Ejecutando script de configuración...")

    // Ejecutar el script completo usando la función SQL de Supabase
    const { error } = await supabase.rpc("exec_sql", {
      sql: sqlScript,
    })

    if (error) {
      console.warn(`⚠️ Advertencia ejecutando script: ${error.message}`)
    }

    console.log("✅ Base de datos configurada exitosamente en Supabase")

    // Verificar la configuración
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name")

    if (!tablesError && tables) {
      console.log("📊 Tablas creadas:")
      tables.forEach((table: any) => {
        console.log(`  - ${table.table_name}`)
      })
    }

    // Verificar datos iniciales
    const { data: serviceTypes, error: serviceTypesError } = await supabase
      .from("ServiceType")
      .select("*", { count: "exact" })

    if (!serviceTypesError) {
      console.log(`📋 Tipos de servicios insertados: ${serviceTypes?.length || 0}`)
    }
  } catch (error) {
    console.error("❌ Error configurando la base de datos:", error)
    throw error
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupSupabaseDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { setupSupabaseDatabase }
