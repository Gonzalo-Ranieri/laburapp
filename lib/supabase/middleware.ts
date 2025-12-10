import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANTE: Evita escribir lógica entre createServerClient y
  // supabase.auth.getUser(). Una configuración simple de middleware_refresh puede
  // ser suficiente para mantener la sesión del usuario fresca.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas - requieren autenticación
  const protectedRoutes = ["/profile", "/dashboard", "/provider", "/messages", "/payments"]

  // Rutas de autenticación - solo para usuarios no autenticados
  const authRoutes = ["/login", "/register", "/forgot-password"]

  const pathname = request.nextUrl.pathname

  // Si el usuario NO está autenticado y trata de acceder a rutas protegidas
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario ESTÁ autenticado y trata de acceder a rutas de auth
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
