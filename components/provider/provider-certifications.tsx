"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Upload, FileText, Trash, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Componente de gestión de certificaciones para proveedores
 *
 * Permite al proveedor añadir y gestionar sus certificaciones
 * y documentos profesionales
 */
export function ProviderCertifications({ providerId }: { providerId: string }) {
  const [certifications, setCertifications] = useState([
    {
      id: "1",
      name: "Técnico Electricista Matriculado",
      issuer: "Consejo Profesional de Ingeniería Eléctrica",
      date: "2018-05-15",
      expiryDate: "2028-05-15",
      documentUrl: "/placeholder.svg?height=100&width=100",
      verified: true,
    },
    {
      id: "2",
      name: "Curso de Seguridad Eléctrica",
      issuer: "Instituto Tecnológico de Buenos Aires",
      date: "2020-03-10",
      expiryDate: null,
      documentUrl: "/placeholder.svg?height=100&width=100",
      verified: true,
    },
    {
      id: "3",
      name: "Especialización en Instalaciones Domiciliarias",
      issuer: "Universidad Tecnológica Nacional",
      date: "2021-11-22",
      expiryDate: null,
      documentUrl: "/placeholder.svg?height=100&width=100",
      verified: false,
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: "",
    expiryDate: "",
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCertification({
        ...newCertification,
        file: e.target.files[0],
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCertification({
      ...newCertification,
      [name]: value,
    })
  }

  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuer || !newCertification.date) {
      return
    }

    setCertifications([
      ...certifications,
      {
        id: Date.now().toString(),
        name: newCertification.name,
        issuer: newCertification.issuer,
        date: newCertification.date,
        expiryDate: newCertification.expiryDate || null,
        documentUrl: newCertification.file
          ? URL.createObjectURL(newCertification.file)
          : "/placeholder.svg?height=100&width=100",
        verified: false,
      },
    ])

    setNewCertification({
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
      file: null,
    })

    setIsDialogOpen(false)
  }

  const handleDeleteCertification = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Mis Certificaciones</h2>
          <p className="text-gray-500">Gestiona tus certificaciones y documentos profesionales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Certificación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Certificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la certificación</Label>
                <Input id="name" name="name" value={newCertification.name} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">Entidad emisora</Label>
                <Input id="issuer" name="issuer" value={newCertification.issuer} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de emisión</Label>
                  <Input id="date" name="date" type="date" value={newCertification.date} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de vencimiento (opcional)</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={newCertification.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Documento o certificado</Label>
                <label htmlFor="file" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    {newCertification.file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8" />
                        <p className="text-sm mt-2">{newCertification.file.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8" />
                        <p className="text-sm mt-2">Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                      </>
                    )}
                  </div>
                </label>
                <Input type="file" id="file" name="file" className="hidden" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCertification}>Añadir Certificación</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="border rounded-lg p-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{cert.name}</h3>
                <p className="text-sm text-gray-500">{cert.issuer}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Emitido: {formatDate(cert.date)}</span>
                  {cert.expiryDate && <span>Vence: {formatDate(cert.expiryDate)}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600"
                onClick={() => handleDeleteCertification(cert.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a
                href={cert.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                Ver documento
              </a>

              {cert.verified ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500 mb-4">No has añadido certificaciones todavía</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Primera Certificación
          </Button>
        </div>
      )}
    </>
  )
}
