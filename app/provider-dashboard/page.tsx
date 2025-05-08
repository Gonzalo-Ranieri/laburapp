"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, DollarSign, Star, TrendingUp, Calendar, Users, ChevronRight, Bell } from "lucide-react"
import { ProviderLayout } from "@/components/provider/provider-layout"
import { getUserFromToken } from "@/lib/client-auth-utils"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function ProviderDashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Obtener información del usuario del token
    const userData = getUserFromToken()
    if (userData) {
      setUser(userData)
    }
  }, [])

  return (
    <ProviderLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard de Proveedor</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name || "Proveedor"}. Aquí puedes gestionar tus servicios y solicitudes.
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+2</span>
              <span className="ml-1">desde ayer</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground pt-1">En progreso ahora</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+15%</span>
              <span className="ml-1">desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <div className="flex items-center pt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400 fill-yellow-400 opacity-50"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs text-muted-foreground">(27 reseñas)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Solicitudes recientes */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Solicitudes recientes</CardTitle>
              <Link href="/provider-requests">
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  Ver todas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Gestiona tus solicitudes de servicio pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "REQ-1234",
                  client: "Juan Pérez",
                  service: "Reparación de cañería",
                  location: "Palermo, CABA",
                  time: "Hace 2 horas",
                  status: "pending",
                },
                {
                  id: "REQ-1235",
                  client: "María González",
                  service: "Instalación de grifería",
                  location: "Belgrano, CABA",
                  time: "Hace 5 horas",
                  status: "pending",
                },
                {
                  id: "REQ-1236",
                  client: "Carlos Rodríguez",
                  service: "Destapación de desagüe",
                  location: "Recoleta, CABA",
                  time: "Hace 1 día",
                  status: "accepted",
                },
              ].map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.client}</p>
                        <Badge
                          variant={request.status === "pending" ? "outline" : "secondary"}
                          className={
                            request.status === "pending"
                              ? "border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-100"
                              : ""
                          }
                        >
                          {request.status === "pending" ? "Pendiente" : "Aceptada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{request.location}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{request.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" className="h-8">
                          Rechazar
                        </Button>
                        <Button size="sm" className="h-8">
                          Aceptar
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="h-8">
                        Ver detalles
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Perfil y progreso */}
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Perfil profesional</CardTitle>
            <CardDescription>Completa tu perfil para aumentar tus oportunidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Completado</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">Información personal</span>
                  </div>
                  <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                    Completado
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">Servicios ofrecidos</span>
                  </div>
                  <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                    Completado
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">Zona de cobertura</span>
                  </div>
                  <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100">
                    Completado
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-orange-100 p-1">
                      <Bell className="h-3 w-3 text-orange-600" />
                    </div>
                    <span className="text-sm">Certificaciones</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-100"
                  >
                    Pendiente
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Completar perfil</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Estadísticas y actividad */}
      <div className="mb-8">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <Tabs defaultValue="stats">
              <div className="flex items-center justify-between">
                <CardTitle>Rendimiento</CardTitle>
                <TabsList>
                  <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Analiza tu rendimiento y actividad reciente</CardDescription>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stats">
              <TabsContent value="stats" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Tasa de aceptación</h3>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">85%</p>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500 font-medium">+5%</span>
                      <span className="ml-1">desde el mes pasado</span>
                    </div>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Tiempo de respuesta</h3>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">15 min</p>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500 font-medium">-3 min</span>
                      <span className="ml-1">desde el mes pasado</span>
                    </div>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Servicios completados</h3>
                      <svg
                        className="h-4 w-4 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold">27</p>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500 font-medium">+8</span>
                      <span className="ml-1">desde el mes pasado</span>
                    </div>
                  </div>
                </div>

                <div className="h-[200px] bg-accent/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de rendimiento (próximamente)</p>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div className="space-y-4">
                  {[
                    {
                      action: "Solicitud aceptada",
                      description: "Has aceptado la solicitud de Carlos Rodríguez",
                      time: "Hace 2 horas",
                      icon: Calendar,
                    },
                    {
                      action: "Servicio completado",
                      description: "Has completado el servicio para Ana Martínez",
                      time: "Hace 1 día",
                      icon: DollarSign,
                    },
                    {
                      action: "Nueva reseña",
                      description: "Has recibido una reseña de 5 estrellas de Luis Gómez",
                      time: "Hace 2 días",
                      icon: Star,
                    },
                  ].map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="rounded-full bg-primary/10 p-2 h-fit">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  )
}
