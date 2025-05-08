"use client"

import { useState, useEffect } from "react"
import { MainNavigation } from "@/components/layout/main-navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageSquare, MapIcon, Loader2 } from "lucide-react"
import { MapView } from "@/components/map-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationTracker } from "@/components/location-tracker"
import { ServicePayment } from "@/components/service-payment"
import { PriceSetter } from "@/components/price-setter"

/**
 * Página de servicios activos
 *
 * Esta página muestra los servicios activos del usuario, organizados en pestañas
 * según su estado (pendientes, en progreso, completados, etc.).
 */
export default function ActiveServicesPage() {
  const [showMap, setShowMap] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [activeServices, setActiveServices] = useState<any[]>([])
  const [historyServices, setHistoryServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProvider, setIsProvider] = useState(false)
  const [providerLocation, setProviderLocation] = useState<any>(null)

  // Cargar servicios activos e historial
  useEffect(() => {
    async function fetchServices() {
      try {
        // Simular carga de datos
        setTimeout(() => {
          // Datos de ejemplo
          const mockActiveServices = [
            {
              id: "serv1",
              status: "PENDING",
              serviceType: { name: "Electricidad" },
              client: { name: "Juan Pérez", image: "https://randomuser.me/api/portraits/men/32.jpg" },
              provider: { name: "Carlos Rodríguez", image: "https://randomuser.me/api/portraits/men/45.jpg" },
              scheduledDate: new Date().toISOString(),
              address: "Av. Corrientes 1234, CABA",
              price: null,
            },
            {
              id: "serv2",
              status: "ACCEPTED",
              serviceType: { name: "Plomería" },
              client: { name: "María González", image: "https://randomuser.me/api/portraits/women/28.jpg" },
              provider: { name: "Roberto Sánchez", image: "https://randomuser.me/api/portraits/men/22.jpg" },
              scheduledDate: new Date().toISOString(),
              address: "Av. Santa Fe 4321, CABA",
              price: 3500,
            },
          ]

          const mockHistoryServices = [
            {
              id: "serv3",
              status: "COMPLETED",
              serviceType: { name: "Limpieza" },
              client: { name: "Laura Fernández", image: "https://randomuser.me/api/portraits/women/22.jpg" },
              provider: { name: "Ana Martínez", image: "https://randomuser.me/api/portraits/women/45.jpg" },
              scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              address: "Av. Cabildo 2468, CABA",
              price: 4500,
            },
            {
              id: "serv4",
              status: "CANCELLED",
              serviceType: { name: "Carpintería" },
              client: { name: "Pedro Gómez", image: "https://randomuser.me/api/portraits/men/28.jpg" },
              provider: { name: "Luis Díaz", image: "https://randomuser.me/api/portraits/men/32.jpg" },
              scheduledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              address: "Av. Rivadavia 5678, CABA",
              price: null,
            },
          ]

          setActiveServices(mockActiveServices)
          setHistoryServices(mockHistoryServices)
          setLoading(false)
        }, 1500)
      } catch (error) {
        console.error("Error al cargar servicios:", error)
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleShowMap = async (service: any) => {
    setSelectedService(service)
    setShowMap(true)

    // Simular obtención de ubicación del proveedor
    if (service.providerId) {
      setProviderLocation({
        userId: service.providerId,
        latitude: -34.603722,
        longitude: -58.381592,
      })
    }
  }

  const handlePriceSet = (serviceId: string, price: number) => {
    // Actualizar el precio en la UI
    setActiveServices((prev) => prev.map((service) => (service.id === serviceId ? { ...service, price } : service)))
  }

  // Convertir los datos del proveedor al formato que espera el componente MapView
  const mapProviders =
    selectedService && providerLocation
      ? [
          {
            id: selectedService.providerId || "provider1",
            name: selectedService.provider?.name || "Profesional",
            latitude: providerLocation.latitude,
            longitude: providerLocation.longitude,
            serviceType: selectedService.serviceType?.name || "Servicio",
          },
        ]
      : []

  return (
    <>
      <MainNavigation />
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Componente invisible para rastrear ubicación si es proveedor */}
        <LocationTracker isProvider={isProvider} onLocationUpdate={() => {}} />

        <h1 className="text-2xl font-bold mb-6">Mis Servicios</h1>

        <Tabs defaultValue="active">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : activeServices.length > 0 ? (
              <div className="space-y-4">
                {activeServices.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={isProvider ? service.client?.image : service.provider?.image || "/placeholder.svg"}
                              alt={isProvider ? service.client?.name : service.provider?.name}
                            />
                            <AvatarFallback>
                              {isProvider
                                ? service.client?.name?.charAt(0) || "C"
                                : service.provider?.name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {isProvider ? service.client?.name : service.provider?.name || "Buscando profesional..."}
                            </h3>
                            <p className="text-sm text-gray-500">{service.serviceType?.name}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            service.status === "PENDING"
                              ? "bg-yellow-500"
                              : service.status === "ACCEPTED"
                                ? "bg-blue-500"
                                : service.status === "IN_PROGRESS"
                                  ? "bg-emerald-500"
                                  : "bg-gray-500"
                          }
                        >
                          {service.status === "PENDING"
                            ? "Pendiente"
                            : service.status === "ACCEPTED"
                              ? "Aceptado"
                              : service.status === "IN_PROGRESS"
                                ? "En progreso"
                                : "Desconocido"}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width:
                                service.status === "PENDING"
                                  ? "25%"
                                  : service.status === "ACCEPTED"
                                    ? "50%"
                                    : service.status === "IN_PROGRESS"
                                      ? "75%"
                                      : "0%",
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Solicitado</span>
                          <span className="text-xs text-gray-500">Aceptado</span>
                          <span className="text-xs text-gray-500">En progreso</span>
                          <span className="text-xs text-gray-500">Completado</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Fecha:</span>{" "}
                            {new Date(service.scheduledDate).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-medium">Dirección:</span> {service.address}
                          </p>
                          {service.price && (
                            <p>
                              <span className="font-medium">Precio:</span> ${service.price.toFixed(2)} ARS
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleShowMap(service)}>
                          <MapIcon className="h-4 w-4 mr-2" />
                          Ver mapa
                        </Button>
                      </div>

                      {/* Mostrar botón para establecer precio si es proveedor y el servicio está en progreso */}
                      {isProvider && service.status === "IN_PROGRESS" && (
                        <div className="mb-4">
                          <PriceSetter
                            requestId={service.id}
                            currentPrice={service.price}
                            onPriceSet={(price) => handlePriceSet(service.id, price)}
                          />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Llamar
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Mensaje
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tienes servicios activos en este momento</p>
                <Button className="mt-4" asChild>
                  <a href="/search">Buscar servicios</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : historyServices.length > 0 ? (
              <div className="space-y-4">
                {historyServices.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={isProvider ? service.client?.image : service.provider?.image || "/placeholder.svg"}
                              alt={isProvider ? service.client?.name : service.provider?.name}
                            />
                            <AvatarFallback>
                              {isProvider
                                ? service.client?.name?.charAt(0) || "C"
                                : service.provider?.name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {isProvider ? service.client?.name : service.provider?.name || "Sin profesional"}
                            </h3>
                            <p className="text-sm text-gray-500">{service.serviceType?.name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(service.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={service.status === "COMPLETED" ? "bg-green-500" : "bg-red-500"}>
                          {service.status === "COMPLETED" ? "Completado" : "Cancelado"}
                        </Badge>
                      </div>

                      {/* Mostrar componente de pago si el servicio está completado y el usuario es cliente */}
                      {service.status === "COMPLETED" && !isProvider && (
                        <div className="mt-4 pt-4 border-t">
                          <ServicePayment
                            requestId={service.id}
                            serviceName={service.serviceType?.name || "Servicio"}
                            status={service.status}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No tienes historial de servicios</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ubicación del profesional</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <MapView height="300px" providers={mapProviders} selectedProviderId={selectedService?.providerId} />
              <div className="mt-4 text-sm">
                <p className="font-medium">
                  {isProvider ? selectedService?.client?.name : selectedService?.provider?.name || "Profesional"}
                </p>
                <p className="text-gray-500">{selectedService?.address}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNavigation />
    </>
  )
}
