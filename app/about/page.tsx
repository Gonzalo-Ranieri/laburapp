import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sobre nosotros | LaburApp",
  description: "Conoce más sobre LaburApp, nuestra misión, visión y el equipo detrás de la plataforma.",
}

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Ana Rodríguez",
      role: "CEO & Fundadora",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Ana fundó LaburApp con la visión de transformar la forma en que las personas encuentran servicios profesionales.",
    },
    {
      name: "Carlos Méndez",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Carlos lidera el desarrollo tecnológico de LaburApp, asegurando una plataforma robusta y escalable.",
    },
    {
      name: "Lucía Fernández",
      role: "Directora de Operaciones",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Lucía supervisa todas las operaciones diarias y asegura que los proveedores y usuarios tengan la mejor experiencia.",
    },
  ]

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Sobre LaburApp</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Conectando personas con los mejores profesionales para cualquier tipo de servicio.
        </p>
      </section>

      {/* Nuestra Historia */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Nuestra Historia</h2>
          <p className="text-muted-foreground">
            LaburApp nació en 2022 con una misión clara: simplificar la forma en que las personas encuentran y contratan
            servicios profesionales. Identificamos que existía una desconexión entre la oferta y la demanda de
            servicios, con procesos complicados y falta de transparencia.
          </p>
          <p className="text-muted-foreground">
            Comenzamos con un pequeño equipo de emprendedores apasionados por la tecnología y la innovación, y hemos
            crecido hasta convertirnos en la plataforma líder de servicios profesionales en la región, conectando a
            miles de usuarios con proveedores calificados cada día.
          </p>
        </div>
        <div className="relative h-[300px] rounded-lg overflow-hidden">
          <Image src="/placeholder.svg?height=600&width=800" alt="Equipo de LaburApp" fill className="object-cover" />
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Nuestra Misión</h2>
            <p className="text-center">
              Conectar a personas con profesionales confiables para resolver sus necesidades de servicios, creando
              oportunidades de trabajo y mejorando la calidad de vida de nuestras comunidades.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Nuestra Visión</h2>
            <p className="text-center">
              Ser la plataforma líder de servicios profesionales en Latinoamérica, reconocida por su excelencia,
              confiabilidad y por generar un impacto positivo en la sociedad.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Valores */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Nuestros Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-2 text-center">
              <h3 className="text-xl font-semibold">Confianza</h3>
              <p>
                Construimos relaciones basadas en la transparencia y la honestidad con nuestros usuarios y proveedores.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2 text-center">
              <h3 className="text-xl font-semibold">Calidad</h3>
              <p>
                Nos esforzamos por ofrecer la mejor experiencia y los mejores servicios a través de nuestra plataforma.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2 text-center">
              <h3 className="text-xl font-semibold">Comunidad</h3>
              <p>Fomentamos el crecimiento económico local y el desarrollo profesional de nuestros proveedores.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Equipo */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Nuestro Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-6 space-y-4 text-center">
                <div className="relative h-40 w-40 mx-auto rounded-full overflow-hidden">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-emerald-600 font-medium">{member.role}</p>
                </div>
                <p className="text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
