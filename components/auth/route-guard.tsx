"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { isAuthenticated, getUserFromToken } from "@/lib/client-auth-utils"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireProvider?: boolean
}

export function RouteGuard({ children, requireAuth = true, requireProvider = false }: RouteGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      // Si no se requiere autenticación, permitir acceso
      if (!requireAuth) {
        setIsAuthorized(true)
        setIsChecking(false)
        return
      }

      // Verificar si el usuario está autenticado
      if (!isAuthenticated()) {
        setError("Debes iniciar sesión para acceder a esta página")
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      // Obtener información del usuario
      const user = getUserFromToken()

      // Si se requiere rol de proveedor, verificar
      if (requireProvider && (!user || !user.isProvider)) {
        setError("No tienes permisos para acceder a esta página")
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      // Usuario autorizado
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [requireAuth, requireProvider, router])

  // Mientras se verifica la autenticación, mostrar un indicador de carga
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    )
  }

  // Si no está autorizado, mostrar mensaje de error
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4 animate-slide-in-up">
            <AlertTitle className="mb-2">Acceso denegado</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/login")} className="w-full">
              Iniciar sesión
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Usuario autorizado, mostrar contenido
  return <>{children}</>
}
