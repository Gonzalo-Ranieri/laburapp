import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Preguntas frecuentes | LaburApp",
  description: "Encuentra respuestas a las preguntas más comunes sobre LaburApp.",
}

export default function FAQPage() {
  const generalFaqs = [
    {
      question: "¿Qué es LaburApp?",
      answer:
        "LaburApp es una plataforma que conecta a personas que necesitan servicios profesionales con proveedores calificados. Facilitamos la búsqueda, contratación y pago de servicios de manera segura y confiable.",
    },
    {
      question: "¿Cómo funciona LaburApp?",
      answer:
        "LaburApp funciona en cuatro pasos sencillos: 1) Busca el servicio que necesitas, 2) Selecciona un profesional basado en reseñas y calificaciones, 3) Agenda una cita directamente con el proveedor, y 4) Realiza el pago de forma segura a través de nuestra plataforma.",
    },
    {
      question: "¿LaburApp está disponible en mi ciudad?",
      answer:
        "Actualmente, LaburApp está disponible en las principales ciudades de Argentina, con planes de expansión a otros países de Latinoamérica. Puedes verificar la disponibilidad en tu área ingresando tu ubicación en la página de búsqueda.",
    },
    {
      question: "¿Cómo puedo contactar al soporte de LaburApp?",
      answer:
        "Puedes contactar a nuestro equipo de soporte a través del formulario de contacto en nuestra página de contacto, enviando un correo a soporte@laburapp.com, o a través de nuestras redes sociales.",
    },
  ]

  const userFaqs = [
    {
      question: "¿Cómo puedo registrarme en LaburApp?",
      answer:
        "Para registrarte, haz clic en el botón 'Registrarse' en la esquina superior derecha de la página. Completa el formulario con tus datos personales y ¡listo! Ya puedes comenzar a buscar servicios.",
    },
    {
      question: "¿Cómo puedo pagar por un servicio?",
      answer:
        "LaburApp ofrece múltiples métodos de pago, incluyendo tarjetas de crédito/débito y Mercado Pago. Los pagos se procesan de forma segura a través de nuestra plataforma una vez que el servicio ha sido completado satisfactoriamente.",
    },
    {
      question: "¿Qué sucede si no estoy satisfecho con el servicio?",
      answer:
        "Si no estás satisfecho con el servicio recibido, puedes reportarlo a través de la plataforma dentro de las 48 horas posteriores a la finalización. Nuestro equipo evaluará el caso y podrá ofrecerte un reembolso parcial o total según corresponda.",
    },
    {
      question: "¿Puedo cancelar una solicitud de servicio?",
      answer:
        "Sí, puedes cancelar una solicitud de servicio hasta 24 horas antes de la hora programada sin ningún cargo. Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a un cargo por cancelación tardía.",
    },
  ]

  const providerFaqs = [
    {
      question: "¿Cómo puedo registrarme como proveedor?",
      answer:
        "Para registrarte como proveedor, haz clic en 'Registrarse' y selecciona la opción 'Proveedor de servicios'. Completa tu perfil profesional, añade tus servicios, establece tus tarifas y zonas de cobertura.",
    },
    {
      question: "¿Cuánto cobra LaburApp por comisión?",
      answer:
        "LaburApp cobra una comisión del 10% sobre el valor de cada servicio completado. Esta comisión incluye el procesamiento de pagos, la promoción de tu perfil y el acceso a nuestra base de clientes.",
    },
    {
      question: "¿Cómo recibo mis pagos?",
      answer:
        "Los pagos se procesan automáticamente después de que el cliente confirma que el servicio ha sido completado satisfactoriamente. El dinero se transfiere a tu cuenta bancaria registrada dentro de los 3-5 días hábiles.",
    },
    {
      question: "¿Puedo establecer mi propia disponibilidad?",
      answer:
        "Sí, tienes control total sobre tu disponibilidad. Puedes establecer tus horarios de trabajo, días libres y zonas geográficas donde ofreces tus servicios a través de tu panel de proveedor.",
    },
  ]

  const categories = [
    { name: "General", faqs: generalFaqs, defaultValue: "general-0" },
    { name: "Para usuarios", faqs: userFaqs, defaultValue: "users-0" },
    { name: "Para proveedores", faqs: providerFaqs, defaultValue: "providers-0" },
  ]

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Preguntas frecuentes</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre LaburApp.
        </p>
      </section>

      {/* Búsqueda de FAQs */}
      <section className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar preguntas frecuentes..."
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <Button className="absolute right-1 top-1 bottom-1">Buscar</Button>
        </div>
      </section>

      {/* Categorías de FAQs */}
      <section className="max-w-3xl mx-auto">
        {categories.map((category, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            <Accordion type="single" collapsible defaultValue={category.defaultValue}>
              {category.faqs.map((faq, faqIndex) => (
                <AccordionItem key={faqIndex} value={`${category.name.toLowerCase()}-${faqIndex}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>

      {/* No encontraste tu pregunta */}
      <section className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg text-center space-y-4">
        <h2 className="text-xl font-semibold">¿No encontraste lo que buscabas?</h2>
        <p className="text-muted-foreground">
          Si tienes alguna pregunta adicional, no dudes en contactarnos. Nuestro equipo de soporte estará encantado de
          ayudarte.
        </p>
        <Link href="/contact">
          <Button>Contactar soporte</Button>
        </Link>
      </section>
    </div>
  )
}
