import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, CreditCard, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Cómo funciona | LaburApp",
  description: "Aprende cómo funciona LaburApp y cómo puedes encontrar o ofrecer servicios en nuestra plataforma.",
}

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Busca el servicio que necesitas",
      description:
        "Explora nuestra amplia gama de categorías o utiliza la búsqueda para encontrar exactamente lo que necesitas.",
      icon: Search,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Selecciona un profesional",
      description: "Compara perfiles, lee reseñas y selecciona al profesional que mejor se adapte a tus necesidades.",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Agenda una cita",
      description: "Coordina directamente con el profesional la fecha y hora que te resulte más conveniente.",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Realiza el pago",
      description: "Paga de forma segura a través de nuestra plataforma una vez que el servicio haya sido completado.",
      icon: CreditCard,
      color: "bg-amber-100 text-amber-600",
    },
  ]

  const forProviders = [
    {
      title: "Regístrate como proveedor",
      description: "Crea tu perfil profesional destacando tus habilidades y experiencia.",
    },
    {
      title: "Configura tus servicios",
      description: "Define los servicios que ofreces, establece tus tarifas y zonas de cobertura.",
    },
    {
      title: "Recibe solicitudes",
      description: "Los clientes te contactarán directamente a través de la plataforma.",
    },
    {
      title: "Cobra por tu trabajo",
      description: "Recibe pagos de forma segura y construye tu reputación con buenas reseñas.",
    },
  ]

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cómo funciona LaburApp</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Conectamos a personas que necesitan servicios con profesionales calificados de manera rápida y sencilla.
        </p>
      </section>

      {/* Video explicativo */}
      <section className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden border">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-muted-foreground">Video explicativo de LaburApp</p>
        </div>
      </section>

      {/* Para usuarios */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Para usuarios</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto">
          Encontrar un profesional confiable nunca fue tan fácil. Sigue estos simples pasos:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="border-t-4 border-t-emerald-500">
              <CardContent className="pt-6 space-y-4">
                <div className={`${step.color} p-3 rounded-full w-fit`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2">{step.description}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-4xl font-bold text-emerald-600/20">{index + 1}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/search">
            <Button size="lg">Buscar servicios ahora</Button>
          </Link>
        </div>
      </section>

      {/* Para proveedores */}
      <section className="space-y-6 bg-gray-50 py-12 px-4 rounded-xl">
        <h2 className="text-3xl font-bold text-center">Para proveedores de servicios</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto">
          Únete a nuestra comunidad de profesionales y haz crecer tu negocio:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            {forProviders.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="bg-emerald-100 text-emerald-600 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link href="/register?type=provider">
                <Button>Regístrate como proveedor</Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Proveedor de servicios"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Lo que dicen nuestros usuarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
                <p className="italic">
                  "LaburApp me permitió encontrar un electricista confiable en cuestión de minutos. El servicio fue
                  excelente y el precio justo."
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image src="/placeholder.svg?height=40&width=40" alt="Usuario" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">Martín García</p>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-emerald-50 p-8 rounded-xl text-center space-y-4">
        <h2 className="text-2xl font-bold">¿Listo para comenzar?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ya sea que necesites un servicio o quieras ofrecer tus habilidades profesionales, LaburApp es la plataforma
          ideal para ti.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <Link href="/search">
            <Button>Buscar servicios</Button>
          </Link>
          <Link href="/register?type=provider">
            <Button variant="outline">Registrarse como proveedor</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
