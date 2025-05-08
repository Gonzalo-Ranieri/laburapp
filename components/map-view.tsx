"use client"

import { useEffect, useRef, useState } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { MapPopup } from "./map-popup"

interface MapViewProps {
  providers?: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    serviceType: string
    image?: string
    rating?: number
    reviewCount?: number
  }>
  onSelectLocation?: (lat: number, lng: number) => void
  height?: string
  interactive?: boolean
  showProviders?: boolean
  selectedProviderId?: string
}

export function MapView({
  providers = [],
  onSelectLocation,
  height = "300px",
  interactive = true,
  showProviders = true,
  selectedProviderId,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { latitude, longitude, loading, error } = useGeolocation()
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null)

  // Simulación de mapa para desarrollo
  useEffect(() => {
    if (!mapContainer.current || !latitude || !longitude) return

    // Simulación de mapa
    const mapElement = mapContainer.current
    mapElement.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; background-color: #e5e7eb; overflow: hidden; border-radius: 0.375rem;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #4b5563;">Mapa simulado</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}</p>
        </div>
        ${providers
          .map(
            (provider, index) => `
          <div style="position: absolute; top: ${50 + index * 10}%; left: ${50 + index * 5}%; transform: translate(-50%, -50%);">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${selectedProviderId === provider.id ? "#f59e0b" : "#3b82f6"}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; cursor: pointer;" data-provider-id="${provider.id}">
              ${provider.name.charAt(0)}
            </div>
          </div>
        `,
          )
          .join("")}
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <div style="width: 16px; height: 16px; border-radius: 50%; background-color: #10b981; border: 2px solid white;"></div>
        </div>
      </div>
    `

    // Agregar eventos de clic
    if (interactive && onSelectLocation) {
      mapElement.addEventListener("click", (e) => {
        // Simular selección de ubicación
        const randomOffset = Math.random() * 0.01 - 0.005
        onSelectLocation(latitude + randomOffset, longitude + randomOffset)
      })
    }

    // Agregar eventos de clic a los marcadores de proveedores
    const providerMarkers = mapElement.querySelectorAll("[data-provider-id]")
    providerMarkers.forEach((marker) => {
      marker.addEventListener("click", (e) => {
        e.stopPropagation()
        const providerId = marker.getAttribute("data-provider-id")
        const provider = providers.find((p) => p.id === providerId)
        if (provider) {
          setSelectedProvider(provider)
          setPopupPosition([e.clientX, e.clientY])
        }
      })
    })

    return () => {
      mapElement.innerHTML = ""
    }
  }, [latitude, longitude, providers, interactive, onSelectLocation, selectedProviderId])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <p className="text-red-500 mb-2">Error: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (loading || !latitude || !longitude) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="rounded-lg overflow-hidden" style={{ height }} />
      {selectedProvider && popupPosition && (
        <MapPopup
          provider={selectedProvider}
          position={popupPosition}
          onClose={() => {
            setSelectedProvider(null)
            setPopupPosition(null)
          }}
        />
      )}
    </div>
  )
}
