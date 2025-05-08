"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Star } from "lucide-react"

/**
 * Componente que muestra una vista previa de las solicitudes cercanas
 *
 * Muestra las solicitudes más recientes y relevantes para el proveedor
 */
export function ProviderRequestsPreview() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setRequests([
        {
          id: "req-001",
          title: "Reparación de cañería",
          category: "Plomería",
          description: "Tengo una pérdida de agua en la cocina, necesito reparación urgente",
          budget: 8500,
          distance: 1.2,
          timePosted: "Hace 15 minutos",
          urgency: "high",
          client: {
            id: "client-001",
            name: "María García",
            rating: 4.7,
            image: null,
          },
          location: {
            address: "Av. Corrientes 1234, CABA",
            coordinates: [-34.603722, -58.381592],
          },
        },
        {
          id: "req-002",
          title: "Instalación de aire acondicionado",
          category: "Climatización",
          description: "Necesito instalar un aire acondicionado split de 3000 frigorías",
          budget: 15000,
          distance: 2.8,
          timePosted: "Hace 45 minutos",
          urgency: "medium",
          client: {
            id: "client-002",
            name: "Carlos López",
            rating: 4.2,
            image: null,
          },
          location: {
            address: "Av. Santa Fe 2500, CABA",
            coordinates: [-34.595887, -58.402811],
          },
        },
        {
          id: "req-003",
          title: "Pintura de living",
          category: "Pintura",
          description: "Necesito pintar mi living de 4x5 metros, paredes y techo",
          budget: 25000,
          distance: 3.5,
          timePosted: "Hace 2 horas",
          urgency: "low",
          client: {
            id: "client-003",
            name: "Laura Martínez",
            rating: 4.9,
            image: null,
          },
          location: {
            address: "Av. Cabildo 1500, CABA",
            coordinates: [-34.565638, -58.451231],
          },
        },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay solicitudes cercanas en este momento</p>
        <Button variant="outline" className="mt-4">
          Actualizar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{request.title}</h3>
                <Badge
                  variant="outline"
                  className={`
                    ${
                      request.urgency === "high"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : request.urgency === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-green-50 text-green-700 border-green-200"
                    }
                  `}
                >
                  {request.urgency === "high" ? "Urgente" : request.urgency === "medium" ? "Prioritario" : "Normal"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-2">{request.description}</p>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{request.distance} km</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{request.timePosted}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>${request.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center mb-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage
                    src={request.client.image || "/placeholder.svg?height=32&width=32"}
                    alt={request.client.name}
                  />
                  <AvatarFallback>{request.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{request.client.rating}</span>
                </div>
              </div>

              <Link href={`/provider/requests/${request.id}`}>
                <Button size="sm">Ver detalles</Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center pt-2">
        <Link href="/provider/requests">
          <Button variant="outline">Ver todas las solicitudes</Button>
        </Link>
      </div>
    </div>
  )
}
