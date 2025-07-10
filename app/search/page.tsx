"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, SlidersHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Forzar renderizado dinámico
export const dynamic = "force-dynamic"

interface Provider {
  id: string
  name: string
  image: string
  rating: number
  reviewCount: number
  services: string[]
  location: string
  distance: number
  priceRange: string
  verified: boolean
  responseTime: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock data
  const mockProviders: Provider[] = [
    {
      id: "1",
      name: "Juan Pérez",
      image: "/placeholder.svg?height=60&width=60",
      rating: 4.8,
      reviewCount: 127,
      services: ["Plomería", "Reparaciones"],
      location: "Palermo, CABA",
      distance: 1.2,
      priceRange: "$$$",
      verified: true,
      responseTime: "Responde en 15 min",
    },
    {
      id: "2",
      name: "María González",
      image: "/placeholder.svg?height=60&width=60",
      rating: 4.9,
      reviewCount: 89,
      services: ["Limpieza", "Organización"],
      location: "Recoleta, CABA",
      distance: 2.1,
      priceRange: "$$",
      verified: true,
      responseTime: "Responde en 30 min",
    },
    {
      id: "3",
      name: "Carlos Rodríguez",
      image: "/placeholder.svg?height=60&width=60",
      rating: 4.7,
      reviewCount: 156,
      services: ["Electricidad", "Instalaciones"],
      location: "Villa Crespo, CABA",
      distance: 3.5,
      priceRange: "$$$",
      verified: false,
      responseTime: "Responde en 1 hora",
    },
  ]

  useEffect(() => {
    // Simular búsqueda
    setLoading(true)
    setTimeout(() => {
      setProviders(mockProviders)
      setLoading(false)
    }, 1000)
  }, [searchQuery, location, category])

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => {
      setProviders(
        mockProviders.filter(
          (provider) =>
            provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.services.some((service) => service.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      )
      setLoading(false)
    }, 500)
  }

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "distance":
        return a.distance - b.distance
      case "reviews":
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header de Búsqueda */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Buscar Profesionales</h1>

        {/* Barra de Búsqueda Principal */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="¿Qué servicio necesitas?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="px-8">
            Buscar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="plomeria">Plomería</SelectItem>
              <SelectItem value="electricidad">Electricidad</SelectItem>
              <SelectItem value="limpieza">Limpieza</SelectItem>
              <SelectItem value="jardineria">Jardinería</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Mejor calificados</SelectItem>
              <SelectItem value="distance">Más cercanos</SelectItem>
              <SelectItem value="reviews">Más reseñas</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedProviders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No se encontraron profesionales</p>
              <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda o amplía tu ubicación</p>
            </CardContent>
          </Card>
        ) : (
          sortedProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          {provider.verified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Verificado
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">({provider.reviewCount} reseñas)</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {provider.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {provider.location} • {provider.distance} km
                          </div>
                          <span>{provider.responseTime}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold mb-2">{provider.priceRange}</div>
                        <Button>Contactar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
