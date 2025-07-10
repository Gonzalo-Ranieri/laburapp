"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error global detallado:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-semibold text-gray-900">¡Oops! Algo salió mal</h1>
          <p className="text-gray-600">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>

          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </Link>
        </div>

        <div className="pt-6 border-t text-sm text-gray-500">
          <p>Si el problema persiste, puedes:</p>
          <div className="space-y-1 mt-2">
            <Link href="/contact" className="block text-emerald-600 hover:underline">
              Contactar soporte técnico
            </Link>
            <Link href="/help" className="block text-emerald-600 hover:underline">
              Visitar el centro de ayuda
            </Link>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-gray-100 p-4 rounded text-xs">
            <summary className="cursor-pointer font-medium">Detalles del error (desarrollo)</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
