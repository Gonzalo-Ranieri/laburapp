"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Calendar, Star, Edit, Camera } from "lucide-react"

/**
 * Componente de información de perfil para proveedores
 *
 * Muestra y permite editar la información básica del perfil
 */
export function ProviderProfileInfo({ user }: { user: any }) {
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.providerProfile?.phone || "11-5555-5555",
    address: user.providerProfile?.address || "Av. Corrientes 1234, CABA",
    bio:
      user.providerProfile?.bio ||
      "Profesional con más de 10 años de experiencia en el rubro. Especializado en instalaciones eléctricas residenciales y comerciales.",
    experience: user.providerProfile?.experience || "10 años",
    workingArea: user.providerProfile?.workingArea || "CABA y GBA Norte",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Aquí se enviaría una solicitud a la API para guardar los cambios
    console.log("Guardando cambios:", profileData)
    setEditing(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle>Información Personal</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? (
                "Cancelar"
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.image || "/placeholder.svg?height=128&width=128"} alt={user.name} />
                  <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {editing && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-4 flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{user.providerProfile?.rating || "4.8"}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({user.providerProfile?.reviewCount || "32"} reseñas)
                </span>
              </div>

              <div className="mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Profesional Verificado
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" name="name" value={profileData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" name="email" value={profileData.email} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" value={profileData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" name="address" value={profileData.address} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Años de experiencia</Label>
                      <Input id="experience" name="experience" value={profileData.experience} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingArea">Área de trabajo</Label>
                      <Input
                        id="workingArea"
                        name="workingArea"
                        value={profileData.workingArea}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía profesional</Label>
                    <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleChange} rows={4} />
                  </div>

                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-xl font-semibold">{profileData.name}</h3>
                    <p className="text-gray-500">{user.providerProfile?.title || "Electricista Profesional"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{profileData.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{profileData.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Miembro desde {user.providerProfile?.joinDate || "Enero 2023"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Sobre mí</h4>
                    <p className="text-gray-600">{profileData.bio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Experiencia</h4>
                      <p className="text-gray-600">{profileData.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Área de trabajo</h4>
                      <p className="text-gray-600">{profileData.workingArea}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
