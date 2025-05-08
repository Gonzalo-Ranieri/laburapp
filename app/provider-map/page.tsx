"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProviderLayout } from "@/app/provider-layout"

export default function ProviderMapPage() {
  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mapa de Servicios</h1>
        <p className="text-muted-foreground">Visualiza las solicitudes de servicio cercanas a tu ubicación.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Servicios Cercanos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-200 h-64 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Mapa no disponible en modo de demostración</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Servicio Cercano #1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Distancia:</strong> 1.2 km
              </p>
              <p>
                <strong>Servicio:</strong> Plomería - Reparación de cañería
              </p>
              <p>
                <strong>Ubicación:</strong> Av. Corrientes 1234, CABA
              </p>
              <div className="mt-4">
                <Button>Ver detalles</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicio Cercano #2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Distancia:</strong> 2.5 km
              </p>
              <p>
                <strong>Servicio:</strong> Plomería - Instalación de grifería
              </p>
              <p>
                <strong>Ubicación:</strong> Av. Santa Fe 5678, CABA
              </p>
              <div className="mt-4">
                <Button>Ver detalles</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  )
}
