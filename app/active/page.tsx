"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User, Phone, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Forzar renderizado dinámico
export const dynamic = "force-dynamic"

interface ActiveService {
  id: string
  title: string
  description: string
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED"
  createdAt: string
  provider?: {
    name: string
    phone: string
    rating: number
  }
  location: string
  estimatedPrice: number
}

export default function ActiveServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<ActiveService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de servicios activos
    const mockServices: ActiveService[] = [
      {
        id: "1",
        title: "Reparación de plomería",
        description: "Reparar fuga en el baño principal",
        status: "IN_PROGRESS",
        createdAt: "2024-01-15T10:00:00Z",
        provider: {
          name: "Juan Pérez",
          phone: "+54 11 1234-5678",
          rating: 4.8,
        },
        location: "Palermo, CABA",
        estimatedPrice: 15000,
      },
      {
        id: "2",
        title: "Limpieza profunda",
        description: "Limpieza completa del departamento",
        status: "ACCEPTED",
        createdAt: "2024-01-14T15:30:00Z",
        provider: {
          name: "María González",
          phone: "+54 11 9876-5432",
          rating: 4.9,
        },
        location: "Recoleta, CABA",
        estimatedPrice: 8000,
      },
    ]

    setTimeout(() => {
      setServices(mockServices)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente"
      case "ACCEPTED":
        return "Aceptado"
      case "IN_PROGRESS":
        return "En progreso"
      case "COMPLETED":
        return "Completado"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Servicios Activos</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Servicios Activos</h1>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">No tienes servicios activos en este momento</p>
            <Button>Solicitar un servicio</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{service.description}</p>
                  </div>
                  <Badge className={getStatusColor(service.status)}>{getStatusText(service.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Solicitado el {new Date(service.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {service.location}
                  </div>

                  {service.provider && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{service.provider.name}</span>
                            <span className="ml-2 text-yellow-600">⭐ {service.provider.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Phone className="h-4 w-4 mr-2" />
                            {service.provider.phone}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Llamar
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio estimado:</span>
                      <span className="font-semibold text-lg">${service.estimatedPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
