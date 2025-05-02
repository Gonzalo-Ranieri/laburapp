"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPaymentInfo() {
      try {
        const paymentId = searchParams.get("payment_id")
        const status = searchParams.get("status")
        const externalReference = searchParams.get("external_reference")

        if (status !== "approved" || !externalReference) {
          return
        }

        // Buscar el pago en nuestra base de datos
        const response = await fetch(`/api/payments/verify?externalReference=${externalReference}`)

        if (response.ok) {
          const data = await response.json()
          setPaymentInfo(data)
        }
      } catch (error) {
        console.error("Error al obtener información del pago:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentInfo()
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pago exitoso!</CardTitle>
          <CardDescription>Tu pago ha sido procesado correctamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
            </div>
          ) : paymentInfo ? (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Servicio:</span>
                <span className="text-sm">{paymentInfo.request?.serviceType?.name || "Servicio"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Monto:</span>
                <span className="text-sm">
                  ${paymentInfo.amount} {paymentInfo.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Estado:</span>
                <span className="text-sm font-medium text-green-600">Aprobado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Fecha:</span>
                <span className="text-sm">
                  {new Date(paymentInfo.updatedAt).toLocaleDateString()}{" "}
                  {new Date(paymentInfo.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No se pudo obtener la información del pago</p>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/active")}>
            Ver mis servicios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
