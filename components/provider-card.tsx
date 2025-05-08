"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Heart, MessageSquare, Phone } from "lucide-react"
import { DynamicTag } from "@/components/dynamic-tag"
import { ProviderBadge } from "@/components/provider-badge"
import { dynamicTags } from "@/data/dynamic-tags"
import { providerBadges } from "@/data/badges"
import { useToast } from "@/hooks/use-toast"

interface Provider {
  id: string
  name: string
  serviceType: string
  image?: string
  rating?: number
  reviewCount?: number
  distance?: number
  price?: string
  availability?: string
  tags?: string[]
  badges?: string[]
}

interface ProviderCardProps {
  provider: Provider
  isSelected?: boolean
  onSelect?: () => void
}

export function ProviderCard({ provider, isSelected = false, onSelect }: ProviderCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  // Filtrar etiquetas y badges que aplican a este proveedor
  const providerTags = provider.tags ? dynamicTags.filter((tag) => provider.tags?.includes(tag.id)) : []

  const providerBadgesList = provider.badges
    ? providerBadges.filter((badge) => provider.badges?.includes(badge.id))
    : []

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)

    toast({
      title: !isFavorite ? "Añadido a favoritos" : "Eliminado de favoritos",
      description: !isFavorite
        ? `Has añadido a ${provider.name} a tus favoritos`
        : `Has eliminado a ${provider.name} de tus favoritos`,
      duration: 3000,
    })
  }

  return (
    <Card
      className={`overflow-hidden transition-all ${isSelected ? "border-emerald-500 shadow-md" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{provider.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isFavorite ? "text-red-500" : "text-gray-400"}`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
              <p className="text-sm text-gray-500">{provider.serviceType}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm ml-1">{provider.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({provider.reviewCount} reseñas)</span>
              </div>
            </div>
          </div>

          {/* Badges y tags */}
          {(providerBadgesList.length > 0 || providerTags.length > 0) && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {providerBadgesList.map((badge) => (
                  <ProviderBadge key={badge.id} badge={badge} size="sm" />
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {providerTags.map((tag) => (
                  <DynamicTag key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {provider.distance
                ? provider.distance < 1
                  ? `${(provider.distance * 1000).toFixed(0)}m`
                  : `${provider.distance.toFixed(1)}km`
                : "Distancia no disponible"}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {provider.availability || "Disponible ahora"}
            </div>
            <div className="text-sm font-medium">{provider.price || "Consultar"}</div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="default" className="flex-1">
              Solicitar Servicio
            </Button>
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
