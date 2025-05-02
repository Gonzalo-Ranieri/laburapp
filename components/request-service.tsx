"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, Upload, Loader2 } from "lucide-react"
import { requestService } from "@/actions/service-actions"
import { MapView } from "@/components/map-view"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function RequestService() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    serviceTypeId: "",
    address: "",
    description: "",
    images: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const { latitude, longitude } = useGeolocation()
  const [serviceTypes, setServiceTypes] = useState([])
  const [nearbyProviders, setNearbyProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)

  // Cargar tipos de servicio
  useEffect(() => {
    async function fetchServiceTypes() {
      try {
        const response = await fetch("/api/services")
        if (response.ok) {
          const data = await response.json()
          setServiceTypes(data)
        }
      } catch (error) {
        console.error("Error al cargar tipos de servicio:", error)
      }
    }

    fetchServiceTypes()
  }, [])

  // Actualizar coordenadas cuando se obtiene la geolocalización
  useEffect(() => {
    if (latitude && longitude && !formData.latitude && !formData.longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
      }))
    }
  }, [latitude, longitude, formData.latitude, formData.longitude])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Buscar proveedores cercanos
      setLoadingProviders(true)
      await findNearbyProviders()
      setStep(2)
    } catch (error) {
      console.error("Error al buscar proveedores:", error)
    } finally {
      setLoading(false)
      setLoadingProviders(false)
    }
  }

  const findNearbyProviders = async () => {
    if (!formData.latitude || !formData.longitude || !formData.serviceTypeId) return

    try {
      const response = await fetch(
        `/api/providers/nearby?latitude=${formData.latitude}&longitude=${formData.longitude}&serviceTypeId=${formData.serviceTypeId}&radius=10`,
      )

      if (response.ok) {
        const data = await response.json()
        setNearbyProviders(data)
      } else {
        console.error("Error al buscar proveedores cercanos:", await response.json())
      }
    } catch (error) {
      console.error("Error al buscar proveedores cercanos:", error)
    }
  }

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider)
  }

  const handleConfirmRequest = async () => {
    setLoading(true)

    const data = new FormData()
    data.append("serviceTypeId", formData.serviceTypeId)
    data.append("address", formData.address)
    data.append("description", formData.description)
    data.append("scheduledDate", new Date().toISOString())

    if (selectedProvider) {
      data.append("providerId", selectedProvider.userId)
    }

    if (formData.latitude && formData.longitude) {
      data.append("latitude", formData.latitude.toString())
      data.append("longitude", formData.longitude.toString())
    }

    formData.images.forEach((img) => data.append("images", img))

    try {
      await requestService(data)
      setStep(3)
    } catch (error) {
      console.error("Error al enviar solicitud:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Solicitar un Servicio</h2>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de servicio</label>
            <Select onValueChange={(value) => handleChange("serviceTypeId", value)} value={formData.serviceTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service: any) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.icon} {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ubicación</label>
            <div className="relative">
              <Input
                placeholder="Tu dirección"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowMap(true)}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.latitude && formData.longitude && (
              <div className="mt-2 text-xs text-gray-500">
                Ubicación seleccionada: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción del problema</label>
            <Textarea
              placeholder="Describe el problema o servicio que necesitas..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fotos (opcional)</label>
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="outline" className="h-24 flex flex-col items-center justify-center">
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-xs">Tomar foto</span>
              </Button>
              <Button type="button" variant="outline" className="h-24 flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 mb-1" />
                <span className="text-xs">Subir foto</span>
              </Button>
              <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400">
                <span className="text-xs">+</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !formData.serviceTypeId ||
              !formData.address ||
              !formData.description ||
              !formData.latitude ||
              !formData.longitude
            }
          >
            {loading ? "Buscando..." : "Buscar profesionales"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-medium">Profesionales disponibles cerca de ti</h3>

          {loadingProviders ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : nearbyProviders.length > 0 ? (
            <div>
              <div className="mb-4">
                <MapView
                  height="200px"
                  providers={nearbyProviders.map((provider: any) => ({
                    id: provider.userId,
                    name: provider.name,
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                    serviceType: provider.serviceName,
                  }))}
                  selectedProviderId={selectedProvider?.userId}
                />
              </div>

              <div className="space-y-3 mt-4">
                {nearbyProviders.map((provider: any) => (
                  <Card
                    key={provider.userId}
                    className={`cursor-pointer transition-all ${
                      selectedProvider?.userId === provider.userId ? "border-emerald-500 shadow-md" : ""
                    }`}
                    onClick={() => handleSelectProvider(provider)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-gray-500">{provider.serviceName}</p>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm ml-1">{provider.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500 ml-1">({provider.reviewCount} reseñas)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{provider.price}</div>
                          <div className="text-xs text-gray-500">
                            {provider.distance < 1
                              ? `${(provider.distance * 1000).toFixed(0)}m`
                              : `${provider.distance.toFixed(1)}km`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button className="flex-1" onClick={handleConfirmRequest} disabled={!selectedProvider || loading}>
                  {loading ? "Enviando..." : "Solicitar servicio"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontraron profesionales disponibles en tu zona</p>
              <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>
                Volver
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">¡Solicitud enviada con éxito!</h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedProvider?.name} recibirá tu solicitud y te contactará pronto para confirmar los detalles.
          </p>
          <Button onClick={() => (window.location.href = "/active")}>Ver mis servicios activos</Button>
        </div>
      )}

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecciona tu ubicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MapView height="300px" onSelectLocation={handleLocationSelect} showProviders={false} />
            <p className="text-xs text-gray-500 mt-2">Haz clic en el mapa para seleccionar tu ubicación exacta</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMap(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowMap(false)}>Confirmar ubicación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
