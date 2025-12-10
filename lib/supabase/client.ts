import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// NOTA: Este cliente solo funciona en el servidor, NO en el navegador
// Para operaciones del servidor, se recomienda usar createAdminClient() de lib/supabase/server.ts
export const supabaseAdmin = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Para usar en componentes cliente:
// const supabase = createClient()
