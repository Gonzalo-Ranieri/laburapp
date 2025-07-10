import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto | LaburApp",
  description: "Ponte en contacto con el equipo de LaburApp para cualquier consulta o soporte.",
}

export default function ContactPage() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      details: "Av. Corrientes 1234, CABA, Argentina",
    },
    {
      icon: Phone,
      title: "Teléfono",
      details: "+54 11 1234-5678",
    },
    {
      icon: Mail,
      title: "Email",
      details: "contacto@laburapp.com",
    },
    {
      icon: Clock,
      title: "Horario de atención",
      details: "Lun - Vie: 9:00 - 18:00",
    },
  ]

  const socialMedia = [
    { icon: Facebook, name: "Facebook", url: "#", color: "hover:bg-blue-600" },
    { icon: Twitter, name: "Twitter", url: "#", color: "hover:bg-sky-500" },
    { icon: Instagram, name: "Instagram", url: "#", color: "hover:bg-pink-600" },
    { icon: Linkedin, name: "LinkedIn", url: "#", color: "hover:bg-blue-700" },
  ]

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Contacto</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo para cualquier consulta.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario de contacto */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Envíanos un mensaje</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre completo
                  </label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico
                  </label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Asunto
                </label>
                <Input id="subject" placeholder="Asunto de tu mensaje" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensaje
                </label>
                <Textarea id="message" placeholder="Escribe tu mensaje aquí..." rows={5} />
              </div>

              <Button type="submit" className="w-full">
                Enviar mensaje
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Información de contacto</h2>

          <div className="grid grid-cols-1 gap-4">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-muted-foreground">{item.details}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Redes sociales */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-3">Síguenos en redes sociales</h3>
            <div className="flex gap-3">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={`bg-gray-100 p-3 rounded-full transition-colors ${social.color} hover:text-white`}
                  aria-label={`Visitar ${social.name}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Mapa */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-3">Nuestra ubicación</h3>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Mapa de ubicación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas frecuentes */}
      <section className="pt-8">
        <h2 className="text-2xl font-bold text-center mb-6">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              q: "¿Cuánto tiempo tarda en responder el soporte?",
              a: "Nuestro equipo de soporte responde a todas las consultas dentro de las 24 horas hábiles.",
            },
            {
              q: "¿Tienen oficinas en otras ciudades?",
              a: "Actualmente solo contamos con oficinas en Buenos Aires, pero ofrecemos soporte remoto para todo el país.",
            },
            {
              q: "¿Puedo visitar sus oficinas sin cita previa?",
              a: "Recomendamos agendar una cita previa para garantizar que podamos atenderte adecuadamente.",
            },
            {
              q: "¿Ofrecen soporte telefónico?",
              a: "Sí, ofrecemos soporte telefónico en horario de oficina de lunes a viernes.",
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="text-muted-foreground text-sm mt-1">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
