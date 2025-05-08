"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isAuthenticated, getUserFromToken } from "@/lib/client-auth-utils"
import { Logo } from "@/components/ui/logo"
import { Search, MapPin, Star, ArrowRight, PenTool, Shield, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (isAuthenticated()) {
      const userData = getUserFromToken()
      setUser(userData)

      // Si es proveedor, redirigir al dashboard de proveedor
      if (userData?.isProvider) {
        router.push("/provider-dashboard")
      }
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="lg" />

          {!user ? (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Hola, {user.name}</span>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("auth_token")
                  router.refresh()
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-accent to-background">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Servicios profesionales a un <span className="text-primary">click de distancia</span>
                </h1>
                <p className="text-lg mb-8 text-muted-foreground max-w-md">
                  LaburApp conecta a personas que necesitan servicios con profesionales calificados en tu área.
                </p>

                <div className="bg-card rounded-lg shadow-lg p-4 mb-8">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="¿Qué servicio necesitas?" className="pl-9" />
                    </div>
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="¿Dónde lo necesitas?" className="pl-9" />
                    </div>
                    <Button>Buscar</Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg">Explorar servicios</Button>
                  <Button variant="outline" size="lg">
                    Cómo funciona
                  </Button>
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="aspect-video bg-gray-100 rounded-md mb-4"></div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Plomería profesional</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm ml-1">4.9</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Soluciones rápidas para todo tipo de problemas de plomería.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary">Desde $1500</span>
                    <Button variant="outline" size="sm">
                      Ver más
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Por qué elegir LaburApp?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conectamos a profesionales verificados con clientes que necesitan servicios de calidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Profesionales verificados</h3>
                  <p className="text-muted-foreground">
                    Todos nuestros profesionales pasan por un riguroso proceso de verificación.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Respuesta rápida</h3>
                  <p className="text-muted-foreground">
                    Recibe respuestas de profesionales disponibles en minutos, no en días.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Variedad de servicios</h3>
                  <p className="text-muted-foreground">
                    Desde plomería hasta carpintería, encuentra todos los servicios que necesitas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-accent/50">
          <div className="container px-4 mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Servicios populares</h2>
                <p className="text-muted-foreground">Descubre los servicios más solicitados en tu zona</p>
              </div>
              <Button variant="link" className="flex items-center">
                Ver todos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="popular" className="mb-12">
              <TabsList className="mb-8 w-full sm:w-auto">
                <TabsTrigger value="popular">Populares</TabsTrigger>
                <TabsTrigger value="recent">Recientes</TabsTrigger>
                <TabsTrigger value="offers">Ofertas</TabsTrigger>
              </TabsList>

              <TabsContent value="popular">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {["Plomería", "Electricidad", "Carpintería", "Limpieza"].map((service, index) => (
                    <Card
                      key={service}
                      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-400">Imagen</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{service}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs ml-1">{4.5 + index * 0.1}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Servicios profesionales de {service.toLowerCase()}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-primary">Desde ${1200 + index * 100}</span>
                          <Button variant="ghost" size="sm">
                            Ver más
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recent">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {["Jardinería", "Pintura", "Mudanzas", "Reparaciones"].map((service, index) => (
                    <Card
                      key={service}
                      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-400">Imagen</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{service}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs ml-1">{4.3 + index * 0.1}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Servicios profesionales de {service.toLowerCase()}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-primary">Desde ${1000 + index * 150}</span>
                          <Button variant="ghost" size="sm">
                            Ver más
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="offers">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[
                    "Limpieza de alfombras",
                    "Instalación de aires",
                    "Reparación de electrodomésticos",
                    "Cerrajería",
                  ].map((service, index) => (
                    <Card
                      key={service}
                      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-400">Imagen</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -20%
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{service}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs ml-1">{4.4 + index * 0.1}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Servicios profesionales con descuento</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs line-through text-muted-foreground">${1500 + index * 200}</span>
                            <span className="text-sm font-medium text-primary ml-1">${1200 + index * 160}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            Ver más
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container px-4 mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">¿Eres un profesional?</h2>
                  <p className="mb-6 text-muted-foreground">
                    Únete a nuestra plataforma y comienza a recibir solicitudes de servicios. Aumenta tus ingresos y
                    construye tu reputación en línea.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center">
                          <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">Recibe solicitudes de servicios en tu área</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center">
                          <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">Gestiona tu agenda y disponibilidad</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center">
                          <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">Recibe pagos de forma segura</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link href="/register?type=provider">
                      <Button size="lg">Registrarse como profesional</Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-gray-200 hidden md:block">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-400">Imagen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="container px-4 mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground">Conectando profesionales con clientes desde 2023.</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Plomería
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Electricidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Carpintería
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Ver todos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Preguntas frecuentes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Términos y condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Política de cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LaburApp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
