"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-emerald-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Página no encontrada</h2>
          <p className="text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Buscar servicios
              </Button>
            </Link>
          </div>

          <Button variant="ghost" onClick={() => window.history.back()} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver atrás
          </Button>
        </div>

        <div className="pt-8 border-t">
          <h3 className="font-semibold mb-3">¿Necesitas ayuda?</h3>
          <div className="space-y-2 text-sm">
            <Link href="/help" className="block text-emerald-600 hover:underline">
              Centro de ayuda
            </Link>
            <Link href="/contact" className="block text-emerald-600 hover:underline">
              Contactar soporte
            </Link>
            <Link href="/faq" className="block text-emerald-600 hover:underline">
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
