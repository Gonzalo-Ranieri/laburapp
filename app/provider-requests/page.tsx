"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProviderLayout } from "@/app/provider-layout"

export default function ProviderRequestsPage() {
  return (
    <ProviderLayout>
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
    </ProviderLayout>
  )
}
