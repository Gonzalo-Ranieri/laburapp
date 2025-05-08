"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Camera, Upload, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useGeolocation } from "@/hooks/use-geolocation"
import { MapView } from "@/components/map-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { categories } from "@/data/categories"

interface RequestServiceFormProps {
  categoryId?: string
  subcategoryId?: string
  providerId?: string
  onSubmit: (formData: FormData) => Promise<void>
}

export function RequestServiceForm({ categoryId, subcategoryId, providerId, onSubmit }: RequestServiceFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryId || "")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  })
  const { latitude, longitude } = useGeolocation()

  // Obtener subcategorías basadas en la categoría seleccionada
  const subcategories = selectedCategory ? categories.find((c) => c.id === selectedCategory)?.subcategories || [] : []

  // Actualizar coordenadas cuando se obtiene la geolocalización
  useEffect(() => {
    if (latitude && longitude && !coordinates.latitude && !coordinates.longitude) {
      setCoordinates({
        latitude,
        longitude,
      })
    }
  }, [latitude, longitude, coordinates])

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({
      latitude: lat,
      longitude: lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("serviceTypeId", selectedSubcategory)
      formData.append("address", address)
      formData.append("description", description)
      formData.append("scheduledDate", date?.toISOString() || new Date().toISOString())

      if (providerId) {
        formData.append("providerId", providerId)
      }

      if (coordinates.latitude && coordinates.longitude) {
        formData.append("latitude", coordinates.latitude.toString())
        formData.append("longitude", coordinates.longitude.toString())
      }

      images.forEach((img) => formData.append("images", img))

      await onSubmit(formData)
    } catch (error) {
      console.error("Error al enviar solicitud:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!categoryId && (
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Tipo de servicio</label>
        <Select
          onValueChange={setSelectedSubcategory}
          value={selectedSubcategory}
          disabled={!selectedCategory && !subcategoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un servicio" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ubicación</label>
        <div className="relative">
          <Input placeholder="Tu dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setShowMap(true)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
        {coordinates.latitude && coordinates.longitude && (
          <div className="mt-2 text-xs text-gray-500">
            Ubicación seleccionada: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha del servicio</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción del problema</label>
        <Textarea
          placeholder="Describe el problema o servicio que necesitas..."
          className="min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fotos (opcional)</label>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" className="h-24 flex flex-col items-center justify-center">
            <Camera className="h-6 w-6 mb-1" />
            <span className="text-xs">Tomar foto</span>
          </Button>
          <Button type="button" variant="outline" className="h-24 flex flex-col items-center justify-center">
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-xs">Subir foto</span>
          </Button>
          <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center text-gray-400">
            <span className="text-xs">+</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          !selectedSubcategory ||
          !address ||
          !description ||
          !date ||
          !coordinates.latitude ||
          !coordinates.longitude
        }
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Solicitar Servicio"
        )}
      </Button>

      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecciona tu ubicación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MapView height="300px" onSelectLocation={handleLocationSelect} showProviders={false} />
            <p className="text-xs text-gray-500 mt-2">Haz clic en el mapa para seleccionar tu ubicación exacta</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMap(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowMap(false)}>Confirmar ubicación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}
