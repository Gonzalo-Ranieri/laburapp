"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, DollarSign, Filter, RotateCcw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

/**
 * Componente de filtros para solicitudes de trabajo
 *
 * Permite a los proveedores filtrar solicitudes por categoría,
 * distancia, precio, urgencia y otros criterios
 */
export function ProviderRequestsFilter() {
  const [distance, setDistance] = useState([10])
  const [priceRange, setPriceRange] = useState([5000, 25000])
  const [categories, setCategories] = useState<string[]>([])
  const [urgency, setUrgency] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const handleCategoryChange = (category: string) => {
    setCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  const resetFilters = () => {
    setDistance([10])
    setPriceRange([5000, 25000])
    setCategories([])
    setUrgency("all")
  }

  const applyFilters = () => {
    // Aquí se enviaría una solicitud a la API con los filtros
    console.log("Aplicando filtros:", {
      distance: distance[0],
      priceRange,
      categories,
      urgency,
    })

    // En móvil, cerrar el panel de filtros
    setShowMobileFilters(false)
  }

  const categoryOptions = [
    { id: "plumbing", label: "Plomería" },
    { id: "electricity", label: "Electricidad" },
    { id: "painting", label: "Pintura" },
    { id: "carpentry", label: "Carpintería" },
    { id: "masonry", label: "Albañilería" },
    { id: "gardening", label: "Jardinería" },
    { id: "cleaning", label: "Limpieza" },
    { id: "hvac", label: "Climatización" },
    { id: "moving", label: "Mudanzas" },
    { id: "tech", label: "Tecnología" },
  ]

  return (
    <>
      {/* Botón de filtros móvil */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" className="w-full" onClick={() => setShowMobileFilters(!showMobileFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {categories.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">{categories.length}</span>
          )}
        </Button>
      </div>

      {/* Panel de filtros móvil */}
      <Collapsible open={showMobileFilters} className="lg:hidden mb-6">
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              {/* Contenido de filtros (igual que en desktop) */}
              <FilterContent
                distance={distance}
                setDistance={setDistance}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                categories={categories}
                handleCategoryChange={handleCategoryChange}
                urgency={urgency}
                setUrgency={setUrgency}
                categoryOptions={categoryOptions}
              />

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetear
                </Button>
                <Button className="flex-1" onClick={applyFilters}>
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Panel de filtros desktop */}
      <Card className="sticky top-20 hidden lg:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Filtros
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500" onClick={resetFilters}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Resetear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <FilterContent
            distance={distance}
            setDistance={setDistance}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            categories={categories}
            handleCategoryChange={handleCategoryChange}
            urgency={urgency}
            setUrgency={setUrgency}
            categoryOptions={categoryOptions}
          />

          <Button className="w-full mt-6" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

/**
 * Contenido de los filtros (compartido entre móvil y desktop)
 */
function FilterContent({
  distance,
  setDistance,
  priceRange,
  setPriceRange,
  categories,
  handleCategoryChange,
  urgency,
  setUrgency,
  categoryOptions,
}: {
  distance: number[]
  setDistance: (value: number[]) => void
  priceRange: number[]
  setPriceRange: (value: number[]) => void
  categories: string[]
  handleCategoryChange: (category: string) => void
  urgency: string
  setUrgency: (value: string) => void
  categoryOptions: { id: string; label: string }[]
}) {
  return (
    <div className="space-y-6">
      {/* Filtro de distancia */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Distancia máxima</Label>
          <span className="text-sm text-gray-500">{distance[0]} km</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Slider value={distance} min={1} max={50} step={1} onValueChange={setDistance} />
        </div>
      </div>

      <Separator />

      {/* Filtro de precio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Rango de precio</Label>
          <span className="text-sm text-gray-500">
            ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <Slider
            value={priceRange}
            min={1000}
            max={100000}
            step={1000}
            minStepsBetweenThumbs={1}
            onValueChange={setPriceRange}
          />
        </div>
      </div>

      <Separator />

      {/* Filtro de categorías */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Categorías</Label>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={categories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filtro de urgencia */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Urgencia</Label>
        <RadioGroup value={urgency} onValueChange={setUrgency}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="urgency-all" />
            <Label htmlFor="urgency-all" className="text-sm font-normal">
              Todas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="urgency-high" />
            <Label htmlFor="urgency-high" className="text-sm font-normal">
              Urgentes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="urgency-medium" />
            <Label htmlFor="urgency-medium" className="text-sm font-normal">
              Prioritarias
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="urgency-low" />
            <Label htmlFor="urgency-low" className="text-sm font-normal">
              Normales
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Filtro de tiempo */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Tiempo publicado</Label>
        <RadioGroup defaultValue="any">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="time-any" />
            <Label htmlFor="time-any" className="text-sm font-normal">
              Cualquier momento
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="today" id="time-today" />
            <Label htmlFor="time-today" className="text-sm font-normal">
              Hoy
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="last24" id="time-last24" />
            <Label htmlFor="time-last24" className="text-sm font-normal">
              Últimas 24 horas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="last3days" id="time-last3days" />
            <Label htmlFor="time-last3days" className="text-sm font-normal">
              Últimos 3 días
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
