import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, MessageCircle, Phone, Mail, FileText, Users, Shield, CreditCard } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Users,
      title: "Primeros pasos",
      description: "Aprende a usar LaburApp",
      articles: ["Cómo crear una cuenta", "Completar tu perfil", "Buscar servicios", "Contactar profesionales"],
    },
    {
      icon: CreditCard,
      title: "Pagos y facturación",
      description: "Todo sobre pagos",
      articles: [
        "Métodos de pago aceptados",
        "Cómo funciona el pago seguro",
        "Solicitar reembolso",
        "Entender tu factura",
      ],
    },
    {
      icon: Shield,
      title: "Seguridad y privacidad",
      description: "Mantén tu cuenta segura",
      articles: [
        "Verificación de profesionales",
        "Reportar un problema",
        "Configuración de privacidad",
        "Autenticación de dos factores",
      ],
    },
    {
      icon: FileText,
      title: "Para proveedores",
      description: "Guías para profesionales",
      articles: ["Registrarse como proveedor", "Optimizar tu perfil", "Gestionar solicitudes", "Recibir pagos"],
    },
  ]

  const quickFaqs = [
    {
      question: "¿Cómo puedo cancelar un servicio?",
      answer:
        "Puedes cancelar un servicio hasta 24 horas antes de la hora programada sin cargo. Ve a 'Mis servicios' y selecciona 'Cancelar' en el servicio correspondiente.",
    },
    {
      question: "¿Qué hago si no estoy satisfecho con el servicio?",
      answer:
        "Si no estás satisfecho, puedes reportarlo dentro de las 48 horas. Nuestro equipo evaluará el caso y podrá ofrecerte un reembolso parcial o total.",
    },
    {
      question: "¿Cómo verifico que un profesional es confiable?",
      answer:
        "Todos nuestros profesionales pasan por un proceso de verificación. Busca el badge de 'Verificado' y lee las reseñas de otros clientes.",
    },
    {
      question: "¿Puedo cambiar mi método de pago?",
      answer:
        "Sí, puedes agregar, editar o eliminar métodos de pago en la sección 'Configuración' > 'Métodos de pago'.",
    },
  ]

  return (
    <div className="container py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Centro de ayuda</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a tus preguntas y aprende a sacar el máximo provecho de LaburApp
          </p>
        </div>

        {/* Búsqueda */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input placeholder="¿En qué podemos ayudarte?" className="pl-10 py-3 text-lg" />
            <Button className="absolute right-1 top-1 bottom-1">Buscar</Button>
          </div>
        </div>

        {/* Contacto rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Chat en vivo</h3>
              <p className="text-sm text-muted-foreground mb-3">Respuesta inmediata</p>
              <Button variant="outline" size="sm">
                Iniciar chat
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Teléfono</h3>
              <p className="text-sm text-muted-foreground mb-3">Lun-Vie 9:00-18:00</p>
              <Button variant="outline" size="sm">
                +54 11 1234-5678
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">Respuesta en 24hs</p>
              <Button variant="outline" size="sm">
                Enviar email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categorías de ayuda */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Explora por categoría</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <category.icon className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link
                          href="#"
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Ver todos
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs rápidas */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible>
            {quickFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-6">
            <Link href="/faq">
              <Button variant="outline">Ver todas las preguntas frecuentes</Button>
            </Link>
          </div>
        </div>

        {/* Recursos adicionales */}
        <div className="bg-gray-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-6">Recursos adicionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Guías detalladas</h3>
              <p className="text-sm text-muted-foreground mb-3">Tutoriales paso a paso para usar todas las funciones</p>
              <Link href="/guides">
                <Button variant="outline" size="sm">
                  Ver guías
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Comunidad</h3>
              <p className="text-sm text-muted-foreground mb-3">Conecta con otros usuarios y comparte experiencias</p>
              <Link href="/community">
                <Button variant="outline" size="sm">
                  Unirse
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Blog</h3>
              <p className="text-sm text-muted-foreground mb-3">Consejos, noticias y actualizaciones de LaburApp</p>
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  Leer blog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contacto final */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">¿No encontraste lo que buscabas?</h2>
          <p className="text-muted-foreground">
            Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta específica
          </p>
          <Link href="/contact">
            <Button>Contactar soporte</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
