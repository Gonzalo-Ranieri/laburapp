"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, Clock, Heart, MessageSquare, Phone, Shield, CheckCircle } from "lucide-react"
import { DynamicTag } from "@/components/dynamic-tag"
import { ProviderBadge } from "@/components/provider-badge"
import { dynamicTags } from "@/data/dynamic-tags"
import { providerBadges } from "@/data/badges"
import { ServicePackage } from "@/components/service-package"
import { MapView } from "@/components/map-view"

interface ProviderPageProps {
  params: {
    providerId: string
  }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  const { providerId } = params

  // Datos de ejemplo para el proveedor
  const provider = {
    id: providerId,
    name: "Martín Gutiérrez",
    serviceType: "Electricista",
    description:
      "Electricista matriculado con más de 12 años de experiencia en instalaciones residenciales y comerciales. Especializado en solución de problemas eléctricos, instalación de tableros, cableado, iluminación LED y sistemas de seguridad.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4.8,
    reviewCount: 127,
    completedJobs: 243,
    memberSince: "2021-03-15",
    location: {
      address: "Villa Crespo, Buenos Aires",
      coordinates: {
        latitude: -34.5982,
        longitude: -58.4376,
      },
    },
    availability: {
      status: "AVAILABLE",
      responseTime: "Generalmente responde en menos de 30 minutos",
    },
    tags: ["highly-rated", "fast-responder", "verified-pro"],
    badges: ["identity-verified", "certified-professional", "experienced", "high-satisfaction"],
    certifications: ["Matriculado por COPIME #12456", "Técnico Electricista - UTN"],
    reviews: [
      {
        id: "rev1",
        userName: "Laura Méndez",
        userImage: "https://randomuser.me/api/portraits/women/33.jpg",
        rating: 5,
        date: "2023-04-28",
        comment: "Excelente trabajo, muy profesional y puntual. Resolvió todos los problemas que teníamos.",
      },
      {
        id: "rev2",
        userName: "Carlos Fernández",
        userImage: "https://randomuser.me/api/portraits/men/22.jpg",
        rating: 4,
        date: "2023-04-15",
        comment: "Buen trabajo, solucionó el problema rápidamente.",
      },
      {
        id: "rev3",
        userName: "María Rodríguez",
        userImage: "https://randomuser.me/api/portraits/women/28.jpg",
        rating: 5,
        date: "2023-04-02",
        comment: "Muy conforme con el trabajo. Quedó todo perfecto y el precio fue justo.",
      },
    ],
    services: [
      {
        id: "serv1",
        name: "Instalación de tablero eléctrico",
        price: 8500,
        description: "Instalación completa de tablero eléctrico con térmicas y disyuntor",
      },
      {
        id: "serv2",
        name: "Reparación de cortocircuito",
        price: 3500,
        description: "Detección y reparación de cortocircuitos en el sistema eléctrico",
      },
      {
        id: "serv3",
        name: "Instalación de luces LED",
        price: 2500,
        description: "Instalación de sistema de iluminación LED",
      },
    ],
    packages: [
      {
        id: "pack1",
        title: "Paquete Básico",
        description: "Revisión general e instalaciones básicas",
        price: 5000,
        services: [
          { id: "ps1", name: "Revisión general", description: "Revisión completa del sistema eléctrico" },
          { id: "ps2", name: "Instalación de enchufes", description: "Hasta 3 enchufes" },
        ],
      },
      {
        id: "pack2",
        title: "Paquete Completo",
        description: "Revisión general e instalaciones avanzadas",
        price: 12000,
        discountPercentage: 15,
        services: [
          { id: "ps1", name: "Revisión general", description: "Revisión completa del sistema eléctrico" },
          { id: "ps2", name: "Instalación de enchufes", description: "Hasta 5 enchufes" },
          { id: "ps3", name: "Instalación de luces", description: "Hasta 3 puntos de luz" },
          { id: "ps4", name: "Revisión de tablero", description: "Revisión y actualización del tablero eléctrico" },
        ],
        popularTag: true,
      },
    ],
  }

  // Filtrar etiquetas y badges que aplican a este proveedor
  const providerTags = provider.tags ? dynamicTags.filter((tag) => provider.tags?.includes(tag.id)) : []

  const providerBadgesList = provider.badges
    ? providerBadges.filter((badge) => provider.badges?.includes(badge.id))
    : []

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex mt-4 space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="md:w-3/4 md:pl-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h1 className="text-2xl font-bold">{provider.name}</h1>
                  <p className="text-gray-500">{provider.serviceType}</p>

                  <div className="flex items-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">{provider.rating}</span>
                    <span className="text-gray-500 ml-1">({provider.reviewCount} reseñas)</span>
                  </div>
                </div>

                <Button className="mt-4 md:mt-0">Solicitar Servicio</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {providerBadgesList.map((badge) => (
                  <ProviderBadge key={badge.id} badge={badge} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {providerTags.map((tag) => (
                  <DynamicTag key={tag.id} tag={tag} />
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{provider.location.address}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{provider.availability.responseTime}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Miembro desde {new Date(provider.memberSince).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{provider.completedJobs} trabajos completados</span>
                </div>
              </div>

              {provider.certifications && provider.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-sm mb-1">Certificaciones</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="w-full">
          <TabsTrigger value="about">Acerca de</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Acerca de {provider.name}</h2>
              <p className="text-gray-700">{provider.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Servicios</h2>
              <div className="space-y-4">
                {provider.services.map((service) => (
                  <div key={service.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${service.price}</p>
                      <Button size="sm" className="mt-1">
                        Solicitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Paquetes de Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {provider.packages.map((pack) => (
              <ServicePackage
                key={pack.id}
                id={pack.id}
                title={pack.title}
                description={pack.description}
                price={pack.price}
                discountPercentage={pack.discountPercentage}
                services={pack.services}
                popularTag={pack.popularTag}
                onSelect={(id) => console.log(`Seleccionado paquete ${id}`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Reseñas</h2>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{provider.rating}</span>
                  <span className="text-gray-500 ml-1">({provider.reviewCount} reseñas)</span>
                </div>
              </div>

              <div className="space-y-6">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={review.userImage || "/placeholder.svg"} alt={review.userName} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{review.userName}</h3>
                          <span className="text-gray-500 text-sm ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
              <p className="mb-4">Área de servicio: {provider.location.address}</p>

              <div className="h-[400px] rounded-lg overflow-hidden border">
                <MapView
                  providers={[
                    {
                      id: provider.id,
                      name: provider.name,
                      latitude: provider.location.coordinates.latitude,
                      longitude: provider.location.coordinates.longitude,
                      serviceType: provider.serviceType,
                    },
                  ]}
                  selectedProviderId={provider.id}
                  height="100%"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
