"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MainNavigation } from "@/components/layout/main-navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { RequestServiceForm } from "@/components/service/request-service-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RequestServicePage() {
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const categoryId = searchParams.get("categoryId") || undefined
  const subcategoryId = searchParams.get("subcategoryId") || undefined
  const providerId = searchParams.get("providerId") || undefined

  const handleSubmit = async (formData: FormData) => {
    try {
      // En una implementación real, esto sería una llamada a la API
      // await fetch("/api/requests", {
      //   method: "POST",
      //   body: formData,
      // })

      // Simular envío exitoso
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de servicio ha sido enviada con éxito",
      })

      // Redirigir después de un tiempo
      setTimeout(() => {
        router.push("/active")
      }, 3000)
    } catch (error) {
      console.error("Error al enviar solicitud:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <MainNavigation />
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-bold mb-6">Solicitar un Servicio</h1>

        <Card>
          <CardHeader>
            <CardTitle>{success ? "¡Solicitud Enviada!" : "Detalles del Servicio"}</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">¡Solicitud enviada con éxito!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Tu solicitud ha sido enviada y pronto recibirás respuesta de los profesionales disponibles.
                </p>
                <p className="text-sm text-gray-500">Serás redirigido a tus servicios activos en unos segundos...</p>
              </div>
            ) : (
              <RequestServiceForm
                categoryId={categoryId}
                subcategoryId={subcategoryId}
                providerId={providerId}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </>
  )
}
