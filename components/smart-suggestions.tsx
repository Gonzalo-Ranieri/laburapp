"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ChevronRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface Provider {
  id: string
  name: string
  serviceType: string
  image?: string
  rating?: number
  reviewCount?: number
}

interface SmartSuggestionsProps {
  title?: string
  subtitle?: string
}

export function SmartSuggestions({
  title = "Recomendados para ti",
  subtitle = "Basado en tus búsquedas recientes y servicios contratados",
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Simular carga de sugerencias
  useEffect(() => {
    // En una implementación real, esto vendría de una API
    const mockSuggestions = [
      {
        id: "prov1",
        name: "Martín Gutiérrez",
        serviceType: "Electricista",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        rating: 4.8,
        reviewCount: 127,
      },
      {
        id: "prov2",
        name: "Laura Sánchez",
        serviceType: "Limpieza de hogar",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
        rating: 4.9,
        reviewCount: 84,
      },
      {
        id: "prov3",
        name: "Carlos Rodríguez",
        serviceType: "Plomero",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 4.7,
        reviewCount: 56,
      },
    ]

    setTimeout(() => {
      setSuggestions(mockSuggestions)
      setLoading(false)
    }, 1000)
  }, [])

  const handleProviderClick = (providerId: string) => {
    router.push(`/providers/${providerId}`)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 text-emerald-500 mr-2" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((provider) => (
              <Button
                key={provider.id}
                variant="ghost"
                className="w-full justify-start p-2 h-auto"
                onClick={() => handleProviderClick(provider.id)}
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="font-medium text-left">{provider.name}</p>
                        <p className="text-sm text-gray-500 text-left">{provider.serviceType}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs ml-1">{provider.rating}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
