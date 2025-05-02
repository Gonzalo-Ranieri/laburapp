"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"
import { ServiceModal } from "./service-modal"

interface ServicesListProps {
  searchQuery: string
}

interface ServiceType {
  id: string
  name: string
  icon: string
  description: string | null
}

interface Provider {
  id: string
  name: string
  rating: number
  reviewCount: number
  price: string
  image: string | null
  serviceName: string
  icon: string
  // Simulated data
  distance: string
  availability: string
}

export function ServicesList({ searchQuery }: ServicesListProps) {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch service types
        const response = await fetch("/api/services")
        if (response.ok) {
          const data = await response.json()
          setServiceTypes(data)
        }

        // Fetch providers (in a real app, this would be paginated and filtered)
        const providersResponse = await fetch("/api/providers")
        if (providersResponse.ok) {
          const providersData = await providersResponse.json()

          // Add simulated data for UI purposes
          const enhancedProviders = providersData.map((provider: any) => ({
            ...provider,
            distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
            availability: Math.random() > 0.5 ? "Disponible ahora" : "Disponible en 1h",
          }))

          setProviders(enhancedProviders)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter providers based on search query
  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.serviceName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Servicios Populares</h2>

      <div className="grid grid-cols-4 gap-4">
        {serviceTypes.map((service) => (
          <div key={service.id} className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center bg-emerald-100 rounded-full mb-2">
              <span className="text-2xl">{service.icon}</span>
            </div>
            <span className="text-sm text-center">{service.name}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold pt-4">Profesionales Destacados</h2>

      {filteredProviders.length > 0 ? (
        <div className="space-y-4">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                      <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.serviceName}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1">{provider.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({provider.reviewCount} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.distance}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.availability}
                    </div>
                    <div className="text-sm font-medium">{provider.price}</div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={() => setSelectedProvider({ ...provider, service: provider.serviceName })}
                  >
                    Solicitar Servicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron profesionales que coincidan con tu búsqueda</p>
        </div>
      )}

      {selectedProvider && <ServiceModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />}
    </div>
  )
}
