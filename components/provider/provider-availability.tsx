"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar } from "lucide-react"

/**
 * Componente para gestionar la disponibilidad del proveedor
 *
 * Permite configurar horarios disponibles por día de la semana
 * y establecer períodos de disponibilidad especiales
 */
export function ProviderAvailability({ providerId }: { providerId: string }) {
  const [availability, setAvailability] = useState({
    monday: { active: true, ranges: [{ start: "08:00", end: "18:00" }] },
    tuesday: { active: true, ranges: [{ start: "08:00", end: "18:00" }] },
    wednesday: { active: true, ranges: [{ start: "08:00", end: "18:00" }] },
    thursday: { active: true, ranges: [{ start: "08:00", end: "18:00" }] },
    friday: { active: true, ranges: [{ start: "08:00", end: "18:00" }] },
    saturday: { active: true, ranges: [{ start: "09:00", end: "14:00" }] },
    sunday: { active: false, ranges: [{ start: "00:00", end: "00:00" }] },
  })

  const [globalAvailability, setGlobalAvailability] = useState(true)

  const handleToggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        active: !prev[day as keyof typeof prev].active,
      },
    }))
  }

  const handleToggleGlobal = () => {
    const newState = !globalAvailability
    setGlobalAvailability(newState)

    // Si se desactiva globalmente, guardar el estado actual para restaurarlo después
    if (!newState) {
      // Aquí se enviaría una solicitud a la API para actualizar el estado
      console.log("Proveedor marcado como no disponible")
    } else {
      // Restaurar disponibilidad previa
      console.log("Proveedor marcado como disponible")
    }
  }

  const handleTimeChange = (day: string, rangeIndex: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => {
      const dayData = prev[day as keyof typeof prev]
      const newRanges = [...dayData.ranges]
      newRanges[rangeIndex] = {
        ...newRanges[rangeIndex],
        [field]: value,
      }

      return {
        ...prev,
        [day]: {
          ...dayData,
          ranges: newRanges,
        },
      }
    })
  }

  const saveAvailability = () => {
    // Aquí se enviaría una solicitud a la API para guardar la disponibilidad
    console.log("Guardando disponibilidad:", availability)
    // Mostrar notificación de éxito
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium">Estado de Disponibilidad</h3>
            <p className="text-sm text-gray-500">Activa o desactiva tu disponibilidad general</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="global-availability" checked={globalAvailability} onCheckedChange={handleToggleGlobal} />
          <Label htmlFor="global-availability">{globalAvailability ? "Disponible" : "No disponible"}</Label>
        </div>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="special">Fechas Especiales</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 pt-4">
          {Object.entries(availability).map(([day, { active, ranges }]) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center justify-between sm:w-1/3">
                <div>
                  <p className="font-medium capitalize">{translateDay(day)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id={`${day}-active`} checked={active} onCheckedChange={() => handleToggleDay(day)} />
                  <Label htmlFor={`${day}-active`} className="text-sm">
                    {active ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </div>

              {active &&
                ranges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2 sm:w-2/3">
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={range.start}
                      onChange={(e) => handleTimeChange(day, index, "start", e.target.value)}
                      disabled={!active}
                    >
                      {generateTimeOptions()}
                    </select>
                    <span>a</span>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      value={range.end}
                      onChange={(e) => handleTimeChange(day, index, "end", e.target.value)}
                      disabled={!active}
                    >
                      {generateTimeOptions()}
                    </select>
                  </div>
                ))}
            </div>
          ))}

          <div className="flex justify-end mt-6">
            <Button onClick={saveAvailability}>Guardar Cambios</Button>
          </div>
        </TabsContent>

        <TabsContent value="special" className="pt-4">
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
            <Calendar className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">Configurar Fechas Especiales</h3>
            <p className="text-sm text-gray-500 text-center mt-1 mb-4">
              Establece disponibilidad para días festivos o vacaciones
            </p>
            <Button variant="outline">Añadir Fecha Especial</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Función auxiliar para traducir los días de la semana
function translateDay(day: string): string {
  const translations: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }
  return translations[day] || day
}

// Función para generar opciones de tiempo en intervalos de 30 minutos
function generateTimeOptions() {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      const time = `${formattedHour}:${formattedMinute}`
      options.push(
        <option key={time} value={time}>
          {time}
        </option>,
      )
    }
  }
  return options
}
