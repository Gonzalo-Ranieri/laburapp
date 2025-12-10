"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

interface ServiceType {
  id: string
  name: string
  icon: string
}

interface ProviderService {
  id: string
  name: string
  description: string
  price: number
  priceType: "FIXED" | "HOURLY" | "NEGOTIABLE"
  duration?: number
  subcategory?: string
  tags: string[]
  requirements?: string
  images: string[]
  isActive: boolean
  serviceType: ServiceType
  createdAt: string
  updatedAt: string
}

interface CreateServiceData {
  name: string
  description: string
  serviceTypeId: string
  price: number
  priceType: "FIXED" | "HOURLY" | "NEGOTIABLE"
  duration?: number
  subcategory?: string
  tags: string[]
  requirements?: string
}

export default function ProviderServices() {
  const [services, setServices] = useState<ProviderService[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ProviderService | null>(null)
  const [formData, setFormData] = useState<CreateServiceData>({
    name: "",
    description: "",
    serviceTypeId: "",
    price: 0,
    priceType: "FIXED",
    duration: undefined,
    subcategory: "",
    tags: [],
    requirements: "",
  })
  const [tagsInput, setTagsInput] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
    fetchServiceTypes()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/provider/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los servicios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceTypes = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServiceTypes(data)
      }
    } catch (error) {
      console.error("Error fetching service types:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.serviceTypeId || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingService ? `/api/provider/services/${editingService.id}` : "/api/provider/services"

      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingService ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
        })

        setIsCreateDialogOpen(false)
        setEditingService(null)
        resetForm()
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al guardar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving service:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      return
    }

    try {
      const response = await fetch(`/api/provider/services/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Servicio eliminado correctamente",
        })
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al eliminar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (service: ProviderService) => {
    try {
      const response = await fetch(`/api/provider/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !service.isActive,
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Servicio ${!service.isActive ? "activado" : "desactivado"} correctamente`,
        })
        fetchServices()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al cambiar el estado del servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling service status:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (service: ProviderService) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      serviceTypeId: service.serviceType.id,
      price: service.price,
      priceType: service.priceType,
      duration: service.duration,
      subcategory: service.subcategory || "",
      tags: service.tags,
      requirements: service.requirements || "",
    })
    setTagsInput(service.tags.join(", "))
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      serviceTypeId: "",
      price: 0,
      priceType: "FIXED",
      duration: undefined,
      subcategory: "",
      tags: [],
      requirements: "",
    })
    setTagsInput("")
    setEditingService(null)
  }

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)

    switch (priceType) {
      case "HOURLY":
        return `${formattedPrice}/hora`
      case "NEGOTIABLE":
        return `Desde ${formattedPrice}`
      default:
        return formattedPrice
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Servicios</h2>
          <p className="text-gray-600">Gestiona los servicios que ofreces</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Servicio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Instalación de grifería"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Categoría *</Label>
                  <Select
                    value={formData.serviceTypeId}
                    onValueChange={(value) => setFormData({ ...formData, serviceTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe detalladamente el servicio que ofreces..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceType">Tipo de Precio</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value: "FIXED" | "HOURLY" | "NEGOTIABLE") =>
                      setFormData({ ...formData, priceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Precio Fijo</SelectItem>
                      <SelectItem value="HOURLY">Por Hora</SelectItem>
                      <SelectItem value="NEGOTIABLE">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoría</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="Ej: Grifería, Desagües, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ej: urgente, fin de semana, garantía (separadas por comas)"
                />
                <p className="text-sm text-gray-500">Separa las etiquetas con comas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos Especiales</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Ej: Acceso a herramientas, materiales incluidos, etc."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingService ? "Actualizar" : "Crear"} Servicio</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes servicios creados aún</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className={`${!service.isActive ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <span className="mr-2">{service.serviceType.icon}</span>
                      {service.serviceType.name}
                      {service.subcategory && ` • ${service.subcategory}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(service)}
                      title={service.isActive ? "Desactivar" : "Activar"}
                    >
                      {service.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Precio:</span>
                    <span className="font-bold text-green-600">{formatPrice(service.price, service.priceType)}</span>
                  </div>

                  {service.duration && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Duración:</span>
                      <span className="text-sm">
                        {service.duration < 60
                          ? `${service.duration} min`
                          : `${Math.floor(service.duration / 60)}h ${service.duration % 60}min`}
                      </span>
                    </div>
                  )}
                </div>

                {service.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {service.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Switch checked={service.isActive} onCheckedChange={() => handleToggleStatus(service)} />
                    <span className="text-sm">{service.isActive ? "Activo" : "Inactivo"}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
