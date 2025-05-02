"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageSquare, MapIcon, Loader2 } from "lucide-react"
import { MapView } from "@/components/map-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LocationTracker } from "@/components/location-tracker"
import { ServicePayment } from "./service-payment"
import { PriceSetter } from "./price-setter"

export function ActiveServices() {
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
        // Verificar si el usuario es un proveedor
        const profileResponse = await fetch("/api/auth/profile")
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setIsProvider(!!profileData.providerProfile)
        }

        // Cargar servicios activos
        const activeResponse = await fetch("/api/requests?status=PENDING,ACCEPTED,IN_PROGRESS")
        if (activeResponse.ok) {
          const activeData = await activeResponse.json()
          setActiveServices(activeData)
        }

        // Cargar historial de servicios
        const historyResponse = await fetch("/api/requests?status=COMPLETED,CANCELLED")
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setHistoryServices(historyData)
        }
      } catch (error) {
        console.error("Error al cargar servicios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleShowMap = async (service: any) => {
    setSelectedService(service)
    setShowMap(true)

    // Si el servicio tiene un proveedor, obtener su ubicación
    if (service.providerId) {
      try {
        const response = await fetch(`/api/location?providerId=${service.providerId}`)
        if (response.ok) {
          const locationData = await response.json()
          setProviderLocation(locationData)
        }
      } catch (error) {
        console.error("Error al obtener ubicación del proveedor:", error)
      }
    }
  }

  const handleLocationUpdate = (location: any) => {
    // Si hay un servicio seleccionado y el usuario es proveedor, actualizar el seguimiento
    if (selectedService && isProvider && selectedService.providerId === providerLocation?.userId) {
      try {
        // Actualizar el seguimiento en tiempo real
        fetch("/api/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: selectedService.id,
            latitude: location.latitude,
            longitude: location.longitude,
            status: selectedService.status,
          }),
        })
      } catch (error) {
        console.error("Error al actualizar seguimiento:", error)
      }
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
            id: selectedService.providerId,
            name: selectedService.provider?.name || "Profesional",
            latitude: providerLocation.latitude,
            longitude: providerLocation.longitude,
            serviceType: selectedService.serviceType?.name || "Servicio",
          },
        ]
      : []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Componente invisible para rastrear ubicación si es proveedor */}
      <LocationTracker isProvider={isProvider} onLocationUpdate={handleLocationUpdate} />

      <h2 className="text-xl font-semibold">Servicios Activos</h2>

      {activeServices.length > 0 ? (
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
                        {isProvider ? service.client?.name?.charAt(0) || "C" : service.provider?.name?.charAt(0) || "P"}
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
                      <span className="font-medium">Fecha:</span> {new Date(service.scheduledDate).toLocaleDateString()}
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
        </div>
      )}

      <h2 className="text-xl font-semibold pt-4">Historial de Servicios</h2>

      <div className="space-y-4">
        {historyServices.length > 0 ? (
          historyServices.map((service) => (
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
                        {isProvider ? service.client?.name?.charAt(0) || "C" : service.provider?.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {isProvider ? service.client?.name : service.provider?.name || "Sin profesional"}
                      </h3>
                      <p className="text-sm text-gray-500">{service.serviceType?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(service.scheduledDate).toLocaleDateString()}</p>
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
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No tienes historial de servicios</p>
          </div>
        )}
      </div>

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
  )
}
