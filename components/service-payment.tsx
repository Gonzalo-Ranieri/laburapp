"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentProcessor } from "./payment-processor"
import { CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface ServicePaymentProps {
  requestId: string
  serviceName: string
  status: string
}

export function ServicePayment({ requestId, serviceName, status }: ServicePaymentProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPaymentInfo() {
      if (!requestId) return

      try {
        const response = await fetch(`/api/payments?requestId=${requestId}`)

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
  }, [requestId])

  const renderPaymentStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          <span>Verificando estado...</span>
        </div>
      )
    }

    if (!paymentInfo) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowPaymentDialog(true)}
          disabled={status !== "COMPLETED"}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Realizar pago
        </Button>
      )
    }

    switch (paymentInfo.status) {
      case "APPROVED":
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Pago completado</span>
          </div>
        )
      case "PENDING":
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="mr-2 h-4 w-4" />
            <span>Pago en proceso</span>
          </div>
        )
      case "REJECTED":
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Pago rechazado</span>
          </div>
        )
      default:
        return (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPaymentDialog(true)}
            disabled={status !== "COMPLETED"}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Reintentar pago
          </Button>
        )
    }
  }

  return (
    <>
      {renderPaymentStatus()}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pago del servicio</DialogTitle>
            <DialogDescription>Completa el pago para finalizar tu servicio</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PaymentProcessor
              requestId={requestId}
              amount={paymentInfo?.amount || 1000} // Monto por defecto si no hay info
              serviceName={serviceName}
              onSuccess={() => setShowPaymentDialog(false)}
              onError={(error) => console.error("Error en pago:", error)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
