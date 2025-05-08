"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, DollarSign, Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Componente que muestra la lista completa de solicitudes
 *
 * Incluye opciones para filtrar, ordenar y ver detalles de cada solicitud
 */
export function ProviderRequestsList({ providerId }: { providerId: string }) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "grid">("list")

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      // Generar 10 solicitudes de ejemplo
      const mockRequests = Array.from({ length: 10 }, (_, i) => ({
        id: `req-${i + 1}`.padStart(6, "0"),
        title: [
          "Reparación de cañería",
          "Instalación eléctrica",
          "Pintura de interiores",
          "Reparación de aire acondicionado",
          "Instalación de muebles",
          "Limpieza de terreno",
          "Reparación de techo",
          "Instalación de pisos",
          "Construcción de pared",
          "Reparación de electrodomésticos",
        ][i % 10],
        category: [
          "Plomería",
          "Electricidad",
          "Pintura",
          "Climatización",
          "Carpintería",
          "Jardinería",
          "Techista",
          "Pisos",
          "Albañilería",
          "Técnico",
        ][i % 10],
        description: "Necesito un profesional con experiencia para realizar este trabajo lo antes posible.",
        budget: Math.floor(Math.random() * 30000) + 5000,
        distance: Math.floor(Math.random() * 50) / 10 + 0.5,
        timePosted: [
          "Hace 10 minutos",
          "Hace 30 minutos",
          "Hace 1 hora",
          "Hace 2 horas",
          "Hace 3 horas",
          "Hace 5 horas",
          "Hace 8 horas",
          "Hace 12 horas",
          "Hace 1 día",
          "Hace 2 días",
        ][i % 10],
        urgency: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        client: {
          id: `client-${i + 1}`.padStart(6, "0"),
          name: [
            "María García",
            "Carlos López",
            "Laura Martínez",
            "Juan Rodríguez",
            "Ana Fernández",
            "Pedro Sánchez",
            "Lucía González",
            "Miguel Torres",
            "Sofía Ramírez",
            "Diego Díaz",
          ][i % 10],
          rating: (Math.floor(Math.random() * 10) + 35) / 10,
          image: null,
        },
        location: {
          address: "Av. Corrientes 1234, CABA",
          coordinates: [-34.603722 + (Math.random() * 0.1 - 0.05), -58.381592 + (Math.random() * 0.1 - 0.05)],
        },
      }))

      setRequests(mockRequests)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [providerId])

  const handleQuickResponse = (requestId: string, accept: boolean) => {
    // Aquí se enviaría una solicitud a la API para aceptar o rechazar
    console.log(`${accept ? "Aceptando" : "Rechazando"} solicitud ${requestId}`)

    // Actualizar la UI para mostrar la acción
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <p className="text-gray-500 mb-4">No hay solicitudes que coincidan con tus filtros</p>
          <Button variant="outline">Actualizar filtros</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{requests.length} solicitudes encontradas</p>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="urgent">Urgentes</TabsTrigger>
              <TabsTrigger value="nearby">Cercanas</TabsTrigger>
              <TabsTrigger value="recent">Recientes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{request.title}</h3>
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
                        {request.urgency === "high"
                          ? "Urgente"
                          : request.urgency === "medium"
                            ? "Prioritario"
                            : "Normal"}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {request.category}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-4">{request.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {request.distance} km - {request.location.address}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{request.timePosted}</span>
                      </div>
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${request.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage
                            src={request.client.image || "/placeholder.svg?height=32&width=32"}
                            alt={request.client.name}
                          />
                          <AvatarFallback>{request.client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{request.client.name}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs">{request.client.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    <Link href={`/provider/requests/${request.id}`}>
                      <Button className="w-full">Ver detalles</Button>
                    </Link>
                    <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex border-t">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none h-12 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleQuickResponse(request.id, true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Aceptar
                </Button>
                <div className="w-px bg-gray-200"></div>
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none h-12 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleQuickResponse(request.id, false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
