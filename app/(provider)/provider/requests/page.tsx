"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ProviderNavigation } from "@/components/provider/provider-navigation"

export default function ProviderRequests() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar autenticación
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("Error al verificar autenticación")
        }

        const data = await res.json()

        if (data.authenticated && data.user) {
          // Verificar si es proveedor
          if (data.user.isProvider) {
            setUser(data.user)
          } else {
            setError("No tienes permisos de proveedor")
            setTimeout(() => {
              router.push("/")
            }, 2000)
          }
        } else {
          setError("No estás autenticado")
          setTimeout(() => {
            router.push("/login?callbackUrl=/provider/requests")
          }, 2000)
        }
      } catch (err) {
        console.error("Error verificando autenticación:", err)
        setError("Error al verificar autenticación")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando solicitudes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <p className="mt-2">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <ProviderNavigation />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Solicitudes de Servicio</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes de servicio recibidas.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Solicitud #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">Cliente: Usuario {i}</p>
                    <p className="text-sm text-muted-foreground">Servicio: Plomería</p>
                    <p className="text-sm text-muted-foreground">Ubicación: A 3km de tu posición</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                    <Button size="sm">Aceptar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
