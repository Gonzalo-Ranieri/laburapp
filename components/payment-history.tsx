"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface PaymentHistoryProps {
  userId: string
  isProvider?: boolean
}

export function PaymentHistory({ userId, isProvider = false }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch(`/api/payments/history?${isProvider ? "providerId=" : "userId="}${userId}`)

        if (!response.ok) {
          throw new Error("Error al cargar historial de pagos")
        }

        const data = await response.json()
        setPayments(data)
      } catch (err) {
        console.error("Error al cargar pagos:", err)
        setError(err instanceof Error ? err.message : "Error al cargar pagos")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [userId, isProvider])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Aprobado</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "REJECTED":
        return <Badge className="bg-red-500">Rechazado</Badge>
      case "REFUNDED":
        return <Badge className="bg-blue-500">Reembolsado</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-gray-500">
        <p>No hay pagos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{isProvider ? "Pagos recibidos" : "Historial de pagos"}</h3>

      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{payment.request?.serviceType?.name || "Servicio"}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString()} -{" "}
                  {new Date(payment.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-500">
                  {isProvider ? "Cliente: " : "Profesional: "}
                  {isProvider ? payment.user?.name : payment.provider?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${payment.amount.toFixed(2)} {payment.currency}
                </p>
                <div className="mt-1">{getStatusBadge(payment.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
