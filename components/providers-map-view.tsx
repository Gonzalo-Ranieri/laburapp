"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, List, Loader2 } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { MapView } from "@/components/map-view"
import { ProviderCard } from "@/components/provider-card"

interface Provider {
  id: string
  name: string
  latitude: number
  longitude: number
  serviceType: string
  image?: string
  rating?: number
  reviewCount?: number
  distance?: number
}

interface ProvidersMapViewProps {
  providers: Provider[]
  isLoading?: boolean
}

export function ProvidersMapView({ providers, isLoading = false }: ProvidersMapViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const { latitude, longitude, loading: locationLoading } = useGeolocation()

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId === selectedProvider ? null : providerId)
  }

  if (isLoading || locationLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{providers.length} profesionales encontrados</h2>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-none"
          >
            <List className="h-4 w-4 mr-1" />
            Lista
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="rounded-none"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Mapa
          </Button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="h-[500px] rounded-lg overflow-hidden border">
          <MapView
            providers={providers}
            selectedProviderId={selectedProvider}
            onSelectProvider={handleProviderSelect}
            userLocation={{ latitude, longitude }}
            height="100%"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={provider.id === selectedProvider}
              onSelect={() => handleProviderSelect(provider.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
