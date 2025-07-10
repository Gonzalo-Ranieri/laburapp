"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Shield } from "lucide-react"

interface Provider {
  id: string
  name: string
  image?: string
  rating: number
  reviewCount: number
  services: string[]
  location: string
  distance?: number
  priceRange: string
  verified: boolean
  responseTime?: string
  description?: string
}

interface ProviderCardProps {
  provider: Provider
  onContact?: (providerId: string) => void
  onViewProfile?: (providerId: string) => void
}

export function ProviderCard({ provider, onContact, onViewProfile }: ProviderCardProps) {
  const handleContact = () => {
    onContact?.(provider.id)
  }

  const handleViewProfile = () => {
    onViewProfile?.(provider.id)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={provider.image || "/placeholder.svg?height=64&width=64"} alt={provider.name} />
            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{provider.name}</h3>
                  {provider.verified && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{provider.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({provider.reviewCount} reseñas)</span>
                </div>

                {provider.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{provider.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {provider.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.services.length - 3} más
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{provider.location}</span>
                    {provider.distance && <span>• {provider.distance} km</span>}
                  </div>
                  {provider.responseTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{provider.responseTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-lg font-semibold mb-2">{provider.priceRange}</div>
                <div className="space-y-2">
                  <Button onClick={handleContact} className="w-full">
                    Contactar
                  </Button>
                  <Button variant="outline" onClick={handleViewProfile} className="w-full bg-transparent">
                    Ver Perfil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
