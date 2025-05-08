"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"
import { getUserFromStorage } from "@/lib/client-only-auth"

/**
 * Componente de banner para el modo de demostración
 *
 * Este componente muestra un banner informativo en la parte superior de la aplicación
 * cuando se está ejecutando en modo de demostración. Proporciona información sobre
 * las limitaciones del modo de demostración y las credenciales disponibles.
 */
export function DemoModeBanner() {
  // Estados para manejar la visibilidad del banner y la información del usuario
  const [isVisible, setIsVisible] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Obtener información del usuario al montar el componente
  useEffect(() => {
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setUser(storedUser)
    }

    // Verificar si el banner debe mostrarse (basado en localStorage)
    const bannerHidden = localStorage.getItem("demo_banner_hidden") === "true"
    if (bannerHidden) {
      setIsVisible(false)
    }
  }, [])

  /**
   * Oculta el banner y guarda la preferencia en localStorage
   */
  const hideBanner = () => {
    setIsVisible(false)
    try {
      localStorage.setItem("demo_banner_hidden", "true")
    } catch (error) {
      console.error("Error al guardar preferencia de banner:", error)
    }
  }

  // No mostrar nada si el banner está oculto
  if (!isVisible) {
    return null
  }

  return (
    <Alert className="rounded-none border-b border-t-0 border-l-0 border-r-0 bg-emerald-50">
      <div className="container flex items-center justify-between py-1">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <AlertTitle className="text-emerald-800">Modo de Demostración</AlertTitle>
            <AlertDescription className="text-emerald-700 text-sm">
              Esta es una versión de demostración con datos simulados. Los cambios no se guardarán permanentemente.
              {user && (
                <span className="font-medium">
                  {" "}
                  Has iniciado sesión como {user.name} ({user.role}).
                </span>
              )}
            </AlertDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={hideBanner} className="text-emerald-800">
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
      </div>
    </Alert>
  )
}
