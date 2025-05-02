"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Loader2 } from "lucide-react"

interface PaymentProcessorProps {
  requestId: string
  amount: number
  serviceName: string
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function PaymentProcessor({ requestId, amount, serviceName, onSuccess, onError }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago")
      }

      // Redirigir al checkout de Mercado Pago
      window.location.href = data.checkoutUrl

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Error al procesar pago:", err)
      setError(err.message || "Error al procesar el pago")

      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procesar pago</CardTitle>
        <CardDescription>Paga por tu servicio de forma segura con Mercado Pago</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Servicio:</span>
            <span className="text-sm">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">Monto:</span>
            <span className="text-sm font-medium">${amount.toFixed(2)} ARS</span>
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePayment} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar con Mercado Pago
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
