"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, CheckCircle, HelpCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ProviderEscrowPaymentsProps {
  providerId: string
}

export function ProviderEscrowPayments({ providerId }: ProviderEscrowPaymentsProps) {
  const [escrowPayments, setEscrowPayments] = useState<any[]>([])
  const [pendingConfirmations, setPendingConfirmations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEscrowData() {
      try {
        // Obtener pagos en escrow
        const paymentsResponse = await fetch(`/api/payments/escrow?providerId=${providerId}`)
        if (!paymentsResponse.ok) {
          throw new Error("Error al cargar pagos en escrow")
        }
        const paymentsData = await paymentsResponse.json()
        setEscrowPayments(paymentsData)

        // Obtener confirmaciones pendientes
        const confirmationsResponse = await fetch(`/api/confirmations/provider?providerId=${providerId}`)
        if (!confirmationsResponse.ok) {
          throw new Error("Error al cargar confirmaciones pendientes")
        }
        const confirmationsData = await confirmationsResponse.json()
        setPendingConfirmations(confirmationsData)
      } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    if (providerId) {
      fetchEscrowData()
    }
  }, [providerId])

  const handleRequestConfirmation = async (requestId: string) => {
    try {
      const response = await fetch("/api/confirmations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        // Actualizar la interfaz
        const data = await response.json()

        // Mover el pago de escrowPayments a pendingConfirmations
        setEscrowPayments((prev) => prev.filter((payment) => payment.requestId !== requestId))

        // Agregar a las confirmaciones pendientes
        setPendingConfirmations((prev) => [
          ...prev,
          {
            id: data.confirmation.id,
            requestId,
            expiresAt: data.expiresAt,
            request: escrowPayments.find((payment) => payment.requestId === requestId)?.request,
          },
        ])
      }
    } catch (error) {
      console.error("Error al solicitar confirmación:", error)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagos en Depósito Seguro</CardTitle>
        </CardHeader>
        <CardContent>
          {escrowPayments.length > 0 ? (
            <div className="space-y-4">
              {escrowPayments.map((payment) => (
                <Card key={payment.id} className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{payment.request?.serviceType?.name || "Servicio"}</p>
                        <p className="text-sm text-gray-500">Cliente: {payment.request?.client?.name || "Cliente"}</p>
                      </div>
                      <Badge className="bg-blue-500">En Depósito</Badge>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm">
                        <p className="font-medium">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          Pagado: {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {payment.request?.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleRequestConfirmation(payment.request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Completado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No tienes pagos en depósito seguro</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmaciones Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingConfirmations.length > 0 ? (
            <div className="space-y-4">
              {pendingConfirmations.map((confirmation) => (
                <Card key={confirmation.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{confirmation.request?.serviceType?.name || "Servicio"}</p>
                        <p className="text-sm text-gray-500">
                          Cliente: {confirmation.request?.client?.name || "Cliente"}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">Esperando Confirmación</Badge>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm">
                        <p className="font-medium">
                          ${confirmation.request?.payment?.amount.toFixed(2) || "0.00"}
                          {confirmation.request?.payment?.currency || "ARS"}
                        </p>
                        <div className="flex items-center text-xs text-yellow-600 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            Expira{" "}
                            {formatDistanceToNow(new Date(confirmation.expiresAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span>Esperando al cliente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No tienes confirmaciones pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
