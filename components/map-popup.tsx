"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface MapPopupProps {
  provider: {
    id: string
    name: string
    serviceType: string
    image?: string
    rating?: number
    reviewCount?: number
  }
  position: [number, number]
  onClose: () => void
}

export function MapPopup({ provider, position, onClose }: MapPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Crear un portal para renderizar el popup
  return createPortal(
    <div
      ref={popupRef}
      className="absolute z-10"
      style={{
        left: `${position[0]}px`,
        top: `${position[1] - 120}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Card className="w-64 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">{provider.name}</h3>
              <p className="text-xs text-gray-500">{provider.serviceType}</p>
              {provider.rating && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs ml-1">{provider.rating}</span>
                  {provider.reviewCount && <span className="text-xs text-gray-500 ml-1">({provider.reviewCount})</span>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="w-4 h-4 bg-white transform rotate-45 absolute left-1/2 -ml-2 -bottom-2 border-r border-b"></div>
    </div>,
    document.body,
  )
}
