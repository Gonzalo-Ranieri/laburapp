"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProviderLayout } from "@/app/provider-layout"
import { getUserFromToken } from "@/lib/client-auth-utils"

export default function ProviderProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Obtener información del usuario del token
    const userData = getUserFromToken()
    if (userData) {
      setUser(userData)
    }
  }, [])

  return (
    <ProviderLayout>
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
                <p className="text-muted-foreground">{user?.name || "Proveedor Demo"}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{user?.email || "proveedor@test.com"}</p>
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
    </ProviderLayout>
  )
}
