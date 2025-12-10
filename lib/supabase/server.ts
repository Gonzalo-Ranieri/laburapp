import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // El método `setAll` fue llamado desde un Server Component.
            // Esto puede ser ignorado si tienes middleware refrescando
            // las sesiones de usuario.
          }
        },
      },
    },
  )
}

// Cliente administrativo para operaciones del servidor
export const createAdminClient = () => {
  return createServerClient<Database>(
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    },
  )
}
