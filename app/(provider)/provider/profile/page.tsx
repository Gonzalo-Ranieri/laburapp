"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ProviderNavigation } from "@/components/provider/provider-navigation"

export default function ProviderProfile() {
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
            router.push("/login?callbackUrl=/provider/profile")
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
        <span className="ml-2">Cargando perfil...</span>
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
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración de servicios.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Nombre</p>
                  <p className="text-muted-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-muted-foreground">+54 11 1234-5678</p>
                </div>
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-muted-foreground">Av. Corrientes 1234, CABA</p>
                </div>
                <Button>Editar información</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Categoría principal</p>
                  <p className="text-muted-foreground">Plomería</p>
                </div>
                <div>
                  <p className="font-medium">Servicios ofrecidos</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Reparación de cañerías</li>
                    <li>Instalación de grifería</li>
                    <li>Destapaciones</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Radio de servicio</p>
                  <p className="text-muted-foreground">10 km</p>
                </div>
                <Button>Editar servicios</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
