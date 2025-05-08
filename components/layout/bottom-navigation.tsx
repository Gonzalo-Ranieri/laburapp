"use client"

import { Home, Search, Clock, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Componente de navegación inferior para dispositivos móviles
 *
 * Este componente proporciona una barra de navegación fija en la parte inferior
 * de la pantalla para facilitar la navegación en dispositivos móviles.
 * Muestra iconos y etiquetas para las principales secciones de la aplicación.
 */
export function BottomNavigation() {
  // Obtener la ruta actual para resaltar el elemento activo
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex justify-around">
        {/* Botón de Inicio */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            pathname === "/" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Inicio</span>
        </Link>

        {/* Botón de Búsqueda */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            pathname === "/search" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">Buscar</span>
        </Link>

        {/* Botón de Servicios Activos */}
        <Link
          href="/active"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            pathname === "/active" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Clock size={24} />
          <span className="text-xs mt-1">Activos</span>
        </Link>

        {/* Botón de Perfil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            pathname === "/profile" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  )
}
