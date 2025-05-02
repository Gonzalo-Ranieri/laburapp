"use client"

import { useEffect, useState } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"

interface LocationTrackerProps {
  isProvider?: boolean
  onLocationUpdate?: (location: { latitude: number; longitude: number; accuracy: number }) => void
  interval?: number // en milisegundos
}

export function LocationTracker({ isProvider = false, onLocationUpdate, interval = 30000 }: LocationTrackerProps) {
  const { latitude, longitude, accuracy, error, loading } = useGeolocation()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!isProvider || loading || error || !latitude || !longitude) return

    const updateLocation = async () => {
      try {
        const response = await fetch("/api/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            accuracy,
          }),
        })

        if (response.ok) {
          setLastUpdate(new Date())
          if (onLocationUpdate) {
            onLocationUpdate({ latitude, longitude, accuracy: accuracy || 0 })
          }
        } else {
          console.error("Error al actualizar ubicación:", await response.json())
        }
      } catch (error) {
        console.error("Error al enviar ubicación:", error)
      }
    }

    // Actualizar inmediatamente al cargar
    updateLocation()

    // Configurar intervalo para actualizaciones periódicas
    const intervalId = setInterval(updateLocation, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [isProvider, latitude, longitude, accuracy, loading, error, onLocationUpdate, interval])

  // Este componente no renderiza nada visible
  return null
}
