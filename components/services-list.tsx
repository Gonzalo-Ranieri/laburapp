"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"

interface ServicesListProps {
  searchQuery: string
  isDemo?: boolean
}

// Datos de demostración para usar cuando no hay autenticación
const demoServiceTypes = [
  { id: "1", name: "Plomería", icon: "🔧", description: "Servicios de plomería" },
  { id: "2", name: "Electricidad", icon: "⚡", description: "Servicios eléctricos" },
  { id: "3", name: "Carpintería", icon: "🪚", description: "Servicios de carpintería" },
  { id: "4", name: "Limpieza", icon: "🧹", description: "Servicios de limpieza" },
]

const demoProviders = [
  {
    id: "1",
    name: "Juan Pérez",
    rating: 4.8,
    reviewCount: 120,
    price: "$1,500 - $2,500",
    image: null,
    serviceName: "Plomería",
    icon: "🔧",
    distance: "2.3 km",
    availability: "Disponible ahora",
  },
  {
    id: "2",
    name: "María González",
    rating: 4.9,
    reviewCount: 85,
    price: "$1,800 - $3,000",
    image: null,
    serviceName: "Electricidad",
    icon: "⚡",
    distance: "1.5 km",
    availability: "Disponible en 1h",
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    rating: 4.7,
    reviewCount: 64,
    price: "$2,000 - $3,500",
    image: null,
    serviceName: "Carpintería",
    icon: "🪚",
    distance: "3.1 km",
    availability: "Disponible ahora",
  },
]

export function ServicesList({ searchQuery, isDemo = false }: ServicesListProps) {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState(demoServiceTypes)
  const [providers, setProviders] = useState(demoProviders)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
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
                    onClick={() => {
                      if (isDemo) {
                        alert("Esta función requiere iniciar sesión. Por favor, inicia sesión para continuar.")
                      } else {
                        setSelectedProvider({ ...provider, service: provider.serviceName })
                      }
                    }}
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

      {/* Eliminamos el modal de servicio para la versión de demostración */}
    </div>
  )
}
