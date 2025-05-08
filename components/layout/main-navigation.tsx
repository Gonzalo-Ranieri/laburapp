"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, User, LogOut, Settings, Bell, Menu } from "lucide-react"

export function MainNavigation() {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()

  // Función para obtener las iniciales del nombre del usuario
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Determinar si estamos en una página específica
  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-600">LaburApp</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
              isActive("/") ? "text-emerald-600" : "text-gray-600"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/search"
            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
              isActive("/search") ? "text-emerald-600" : "text-gray-600"
            }`}
          >
            Buscar
          </Link>
          {user && (
            <Link
              href="/active"
              className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                isActive("/active") ? "text-emerald-600" : "text-gray-600"
              }`}
            >
              Mis Servicios
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Mostrar botones de autenticación o menú de usuario */}
          {loading ? (
            // Mostrar un placeholder mientras se carga
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          ) : user ? (
            // Usuario autenticado - mostrar menú desplegable
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {user.providerProfile && (
                  <DropdownMenuItem asChild>
                    <Link href="/provider/dashboard" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Panel de Proveedor
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaciones
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Usuario no autenticado - mostrar botones de inicio de sesión y registro
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}

          {/* Menú móvil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/search" className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Link>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem asChild>
                  <Link href="/active" className="cursor-pointer">
                    Mis Servicios
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
