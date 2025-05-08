"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, User, Map, Calendar, Bell } from "lucide-react"

interface ProviderLayoutProps {
  children: ReactNode
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Panel de Proveedor</h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Ver notificaciones</span>
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>
            <div className="flex items-center">
              <img className="h-8 w-8 rounded-full" src="/placeholder.svg?height=32&width=32" alt="Foto de perfil" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6">{children}</main>

      {/* Bottom navigation for mobile */}
      <nav className="sm:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around">
          <Link
            href="/provider-dashboard"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              pathname === "/provider-dashboard" ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className="h-6 w-6" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/provider-requests"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              pathname === "/provider-requests" ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="h-6 w-6" />
            <span>Solicitudes</span>
          </Link>
          <Link
            href="/provider-map"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              pathname === "/provider-map" ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Map className="h-6 w-6" />
            <span>Mapa</span>
          </Link>
          <Link
            href="/provider-profile"
            className={`flex flex-col items-center py-2 px-3 text-xs ${
              pathname === "/provider-profile" ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="h-6 w-6" />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

// Añadir exportación nombrada para ProviderLayout

export default ProviderLayout
