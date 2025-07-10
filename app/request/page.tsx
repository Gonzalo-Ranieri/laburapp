"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Clock, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Forzar renderizado dinámico
export const dynamic = "force-dynamic"

export default function RequestServicePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    serviceType: "",
    title: "",
    description: "",
    location: "",
    preferredDate: "",
    preferredTime: "",
    budget: "",
    urgency: "normal",
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular envío de solicitud
    setTimeout(() => {
      setLoading(false)
      alert("¡Solicitud enviada exitosamente! Te contactaremos pronto.")
      // Reset form
      setFormData({
        serviceType: "",
        title: "",
        description: "",
        location: "",
        preferredDate: "",
        preferredTime: "",
        budget: "",
        urgency: "normal",
      })
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Solicitar Servicio</h1>
        <p className="text-gray-600">Completa el formulario para solicitar un servicio profesional</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Servicio */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo de Servicio *</Label>
              <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plomeria">Plomería</SelectItem>
                  <SelectItem value="electricidad">Electricidad</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="jardineria">Jardinería</SelectItem>
                  <SelectItem value="pintura">Pintura</SelectItem>
                  <SelectItem value="carpinteria">Carpintería</SelectItem>
                  <SelectItem value="mudanza">Mudanza</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del Servicio *</Label>
              <Input
                id="title"
                placeholder="Ej: Reparar fuga en el baño"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Detallada *</Label>
              <Textarea
                id="description"
                placeholder="Describe el problema o trabajo que necesitas..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Dirección o zona"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Fecha y Hora Preferida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Fecha Preferida</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Hora Preferida</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="preferredTime"
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Presupuesto */}
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto Estimado</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="budget"
                  placeholder="Ej: $10,000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Urgencia */}
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgencia</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja - Puedo esperar</SelectItem>
                  <SelectItem value="normal">Normal - Esta semana</SelectItem>
                  <SelectItem value="high">Alta - Urgente</SelectItem>
                  <SelectItem value="emergency">Emergencia - Hoy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón de Envío */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading || !formData.serviceType || !formData.title || !formData.description || !formData.location
              }
            >
              {loading ? "Enviando..." : "Solicitar Servicio"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">¿Cómo funciona?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Completa el formulario con los detalles de tu solicitud</p>
            <p>2. Los profesionales cercanos recibirán tu solicitud</p>
            <p>3. Te contactarán para coordinar el servicio</p>
            <p>4. Elige el profesional que mejor se adapte a tus necesidades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
