"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash, DollarSign, Clock } from "lucide-react"

/**
 * Componente de gestión de servicios para proveedores
 *
 * Permite al proveedor añadir, editar y eliminar los servicios que ofrece
 */
export function ProviderServices({ providerId }: { providerId: string }) {
  const [services, setServices] = useState([
    {
      id: "1",
      name: "Instalación eléctrica residencial",
      description:
        "Instalación completa o parcial de sistemas eléctricos en hogares, incluyendo cableado, tomacorrientes, iluminación y tableros.",
      price: 8500,
      priceType: "hourly",
      category: "Electricidad",
      active: true,
    },
    {
      id: "2",
      name: "Reparación de cortocircuitos",
      description:
        "Diagnóstico y reparación de problemas eléctricos, cortocircuitos, sobrecargas y fallos en el sistema.",
      price: 5000,
      priceType: "fixed",
      category: "Electricidad",
      active: true,
    },
    {
      id: "3",
      name: "Instalación de luminarias",
      description: "Instalación de todo tipo de luminarias: plafones, apliques, spots, colgantes y sistemas LED.",
      price: 3500,
      priceType: "fixed",
      category: "Electricidad",
      active: false,
    },
  ])

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    priceType: "hourly",
    category: "Electricidad",
    active: true,
  })

  const [editingService, setEditingService] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddService = () => {
    if (!newService.name || !newService.description || !newService.price) {
      return
    }

    setServices([
      ...services,
      {
        id: Date.now().toString(),
        name: newService.name,
        description: newService.description,
        price: Number.parseFloat(newService.price),
        priceType: newService.priceType,
        category: newService.category,
        active: newService.active,
      },
    ])

    setNewService({
      name: "",
      description: "",
      price: "",
      priceType: "hourly",
      category: "Electricidad",
      active: true,
    })

    setIsDialogOpen(false)
  }

  const handleEditService = () => {
    if (!editingService) return

    setServices(services.map((service) => (service.id === editingService.id ? editingService : service)))

    setEditingService(null)
    setIsDialogOpen(false)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter((service) => service.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setServices(services.map((service) => (service.id === id ? { ...service, active: !service.active } : service)))
  }

  const openEditDialog = (service: any) => {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Mis Servicios</h2>
          <p className="text-gray-500">Gestiona los servicios que ofreces a tus clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Servicio" : "Añadir Nuevo Servicio"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servicio</Label>
                <Input
                  id="name"
                  value={editingService ? editingService.name : newService.name}
                  onChange={(e) =>
                    editingService
                      ? setEditingService({ ...editingService, name: e.target.value })
                      : setNewService({ ...newService, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={editingService ? editingService.description : newService.description}
                  onChange={(e) =>
                    editingService
                      ? setEditingService({ ...editingService, description: e.target.value })
                      : setNewService({ ...newService, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="price"
                      type="number"
                      className="pl-8"
                      value={editingService ? editingService.price : newService.price}
                      onChange={(e) =>
                        editingService
                          ? setEditingService({ ...editingService, price: e.target.value })
                          : setNewService({ ...newService, price: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceType">Tipo de precio</Label>
                  <select
                    id="priceType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingService ? editingService.priceType : newService.priceType}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, priceType: e.target.value })
                        : setNewService({ ...newService, priceType: e.target.value })
                    }
                  >
                    <option value="hourly">Por hora</option>
                    <option value="fixed">Precio fijo</option>
                    <option value="negotiable">Negociable</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingService ? editingService.category : newService.category}
                  onChange={(e) =>
                    editingService
                      ? setEditingService({ ...editingService, category: e.target.value })
                      : setNewService({ ...newService, category: e.target.value })
                  }
                >
                  <option value="Electricidad">Electricidad</option>
                  <option value="Plomería">Plomería</option>
                  <option value="Carpintería">Carpintería</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Albañilería">Albañilería</option>
                  <option value="Jardinería">Jardinería</option>
                  <option value="Limpieza">Limpieza</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingService ? editingService.active : newService.active}
                  onCheckedChange={(checked) =>
                    editingService
                      ? setEditingService({ ...editingService, active: checked })
                      : setNewService({ ...newService, active: checked })
                  }
                />
                <Label htmlFor="active">Servicio activo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingService ? handleEditService : handleAddService}>
                {editingService ? "Guardar Cambios" : "Añadir Servicio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id} className={`${!service.active ? "opacity-70" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="font-medium">${service.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm ml-1">
                      {service.priceType === "hourly" ? "/hora" : service.priceType === "fixed" ? "fijo" : "negociable"}
                    </span>
                  </div>

                  {service.priceType === "hourly" && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">Mín. 2 horas</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id={`active-${service.id}`}
                    checked={service.active}
                    onCheckedChange={() => handleToggleActive(service.id)}
                  />
                  <Label htmlFor={`active-${service.id}`} className="text-sm">
                    {service.active ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-gray-500 mb-4">No has añadido ningún servicio todavía</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primer Servicio
                </Button>
              </DialogTrigger>
              <DialogContent>{/* Contenido del diálogo (igual que arriba) */}</DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </>
  )
}
