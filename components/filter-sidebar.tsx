"use client"

import { useState } from "react"
import { filters } from "@/data/filters"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, SlidersHorizontal, X } from "lucide-react"

interface FilterSidebarProps {
  onFilterChange: (filters: Record<string, any>) => void
  isMobile?: boolean
}

export function FilterSidebar({ onFilterChange, isMobile = false }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(!isMobile)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({
    "location-radius": 10,
    availability: "any",
    "price-range": [0, 10000],
    rating: 0,
    "payment-method": [],
    certification: false,
    "contact-method": "any",
  })
  const [date, setDate] = useState<Date | undefined>(undefined)

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...selectedFilters, [filterId]: value }
    setSelectedFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      "location-radius": 10,
      availability: "any",
      "price-range": [0, 10000],
      rating: 0,
      "payment-method": [],
      certification: false,
      "contact-method": "any",
    }
    setSelectedFilters(defaultFilters)
    setDate(undefined)
    onFilterChange(defaultFilters)
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={toggleSidebar} className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">
            Limpiar filtros
          </Button>
        </div>
      )}

      <div className={`${isMobile ? (isOpen ? "block" : "hidden") : "block"} bg-white p-4 rounded-lg border`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Filtros</h3>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <Label className="text-sm font-medium">{filter.name}</Label>

              {filter.type === "slider" && (
                <div className="space-y-2">
                  <Slider
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                    value={[selectedFilters[filter.id]]}
                    onValueChange={(value) => handleFilterChange(filter.id, value[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {selectedFilters[filter.id]} {filter.unit}
                    </span>
                    <span>
                      {filter.max} {filter.unit}
                    </span>
                  </div>
                </div>
              )}

              {filter.type === "range" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      value={selectedFilters[filter.id][0]}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        handleFilterChange(filter.id, [value, selectedFilters[filter.id][1]])
                      }}
                      className="w-24"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      value={selectedFilters[filter.id][1]}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        handleFilterChange(filter.id, [selectedFilters[filter.id][0], value])
                      }}
                      className="w-24"
                    />
                  </div>
                </div>
              )}

              {filter.type === "select" && (
                <Select
                  value={selectedFilters[filter.id]}
                  onValueChange={(value) => {
                    handleFilterChange(filter.id, value)
                    if (filter.id === "availability" && value === "specific-date") {
                      setDate(new Date())
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.id} value={option.value.toString()}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filter.id === "availability" && selectedFilters[filter.id] === "specific-date" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              )}

              {filter.type === "multiselect" && (
                <div className="space-y-2">
                  {filter.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedFilters[filter.id].includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange(filter.id, [...selectedFilters[filter.id], option.value])
                          } else {
                            handleFilterChange(
                              filter.id,
                              selectedFilters[filter.id].filter((value: any) => value !== option.value),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={option.id} className="text-sm font-normal">
                        {option.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {filter.type === "radio" && (
                <RadioGroup
                  value={selectedFilters[filter.id].toString()}
                  onValueChange={(value) => handleFilterChange(filter.id, Number.parseFloat(value))}
                >
                  {filter.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value.toString()} id={option.id} />
                      <Label htmlFor={option.id} className="text-sm font-normal">
                        {option.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {filter.type === "toggle" && (
                <div className="flex items-center justify-between">
                  <Label htmlFor={filter.id} className="text-sm font-normal">
                    {filter.options?.[0].name}
                  </Label>
                  <Switch
                    id={filter.id}
                    checked={selectedFilters[filter.id]}
                    onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <Button className="w-full" onClick={() => onFilterChange(selectedFilters)}>
            Aplicar filtros
          </Button>
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>
    </>
  )
}
