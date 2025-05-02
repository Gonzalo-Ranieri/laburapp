"use client"

import { useEffect, useRef, useState } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { OSM_ATTRIBUTION } from "@/lib/map-config"
import { MapPopup } from "./map-popup"

// Importaciones de OpenLayers
import "ol/ol.css"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { fromLonLat, toLonLat } from "ol/proj"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style"

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
  const map = useRef<Map | null>(null)
  const vectorSource = useRef<VectorSource | null>(null)
  const userFeature = useRef<Feature | null>(null)
  const { latitude, longitude, loading, error } = useGeolocation()
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null)

  // Inicializar mapa cuando tenemos coordenadas
  useEffect(() => {
    if (!mapContainer.current || map.current || !latitude || !longitude) return

    // Crear capa de vectores para marcadores
    vectorSource.current = new VectorSource()
    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
    })

    // Crear mapa
    const newMap = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: [OSM_ATTRIBUTION],
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([longitude, latitude]),
        zoom: 14,
      }),
      controls: interactive ? undefined : [],
      interactions: interactive ? undefined : [],
    })

    map.current = newMap

    // Añadir marcador del usuario
    userFeature.current = new Feature({
      geometry: new Point(fromLonLat([longitude, latitude])),
      name: "Usuario",
      type: "user",
    })

    userFeature.current.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#10b981" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    )

    vectorSource.current.addFeature(userFeature.current)

    // Si es interactivo, permitir seleccionar ubicación
    if (interactive && onSelectLocation) {
      newMap.on("click", (e) => {
        const coordinates = toLonLat(e.coordinate)
        onSelectLocation(coordinates[1], coordinates[0])

        if (userFeature.current) {
          userFeature.current.getGeometry()?.setCoordinates(e.coordinate)
        }
      })
    }

    // Manejar clics en marcadores
    newMap.on("click", (e) => {
      newMap.forEachFeatureAtPixel(e.pixel, (feature) => {
        if (feature.get("type") === "provider") {
          const provider = providers.find((p) => p.id === feature.get("id"))
          if (provider) {
            setSelectedProvider(provider)
            setPopupPosition(e.pixel)
          }
          return true
        }
        return false
      })
    })

    setMapLoaded(true)

    return () => {
      newMap.setTarget(undefined)
      map.current = null
    }
  }, [latitude, longitude, interactive, onSelectLocation, providers])

  // Actualizar posición del usuario cuando cambia
  useEffect(() => {
    if (!map.current || !latitude || !longitude || !userFeature.current) return

    const userCoordinates = fromLonLat([longitude, latitude])
    userFeature.current.getGeometry()?.setCoordinates(userCoordinates)

    // Centrar mapa en la posición del usuario si no hay proveedores seleccionados
    if (!selectedProviderId) {
      map.current.getView().setCenter(userCoordinates)
    }
  }, [latitude, longitude, selectedProviderId])

  // Añadir marcadores de proveedores
  useEffect(() => {
    if (!map.current || !mapLoaded || !showProviders || !vectorSource.current) return

    // Limpiar marcadores de proveedores anteriores
    const features = vectorSource.current.getFeatures()
    features.forEach((feature) => {
      if (feature.get("type") === "provider") {
        vectorSource.current?.removeFeature(feature)
      }
    })

    // Añadir nuevos marcadores
    providers.forEach((provider) => {
      const providerFeature = new Feature({
        geometry: new Point(fromLonLat([provider.longitude, provider.latitude])),
        name: provider.name,
        id: provider.id,
        serviceType: provider.serviceType,
        type: "provider",
      })

      const isSelected = selectedProviderId === provider.id

      providerFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({ color: isSelected ? "#f59e0b" : "#3b82f6" }),
            stroke: new Stroke({ color: "white", width: 2 }),
          }),
          text: new Text({
            text: provider.name.charAt(0),
            fill: new Fill({ color: "white" }),
            font: "bold 12px sans-serif",
            offsetY: 1,
          }),
        }),
      )

      vectorSource.current?.addFeature(providerFeature)
    })

    // Si hay un proveedor seleccionado, centrar en él
    if (selectedProviderId && map.current) {
      const selectedProvider = providers.find((p) => p.id === selectedProviderId)
      if (selectedProvider) {
        map.current.getView().animate({
          center: fromLonLat([selectedProvider.longitude, selectedProvider.latitude]),
          zoom: 15,
          duration: 1000,
        })
      }
    }
  }, [providers, mapLoaded, showProviders, selectedProviderId])

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
