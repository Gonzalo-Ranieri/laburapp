"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface PendingConfirmationsProps {
  userId: string
  onRefresh?: () => void
}

export function PendingConfirmations({ userId, onRefresh }: PendingConfirmationsProps) {
  const [confirmations, setConfirmations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchConfirmations()
  }, [userId])

  const fetchConfirmations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/confirmations")
      if (response.ok) {
        const data = await response.json()
        setConfirmations(data)
      }
    } catch (error) {
      console.error("Error al cargar confirmaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (confirmationId: string, confirmed: boolean) => {
    try {
      setProcessingId(confirmationId)
      const response = await fetch(`/api/confirmations/${confirmationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmed }),
      })

      if (response.ok) {
        // Actualizar la lista de confirmaciones
        setConfirmations((prev) => prev.filter((conf) => conf.id !== confirmationId))

        // Notificar al componente padre si se proporciona onRefresh
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error) {
      console.error("Error al procesar confirmación:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Clock className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (confirmations.length === 0) {
    return null // No mostrar nada si no hay confirmaciones pendientes
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Servicios por confirmar</h3>

      {confirmations.map((confirmation) => {
        const timeLeft = formatDistanceToNow(new Date(confirmation.expiresAt), {
          addSuffix: true,
          locale: es,
        })

        return (
          <Card key={confirmation.id} className="border-yellow-300 border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={confirmation.request.provider?.image || "/placeholder.svg"}
                      alt={confirmation.request.provider?.name}
                    />
                    <AvatarFallback>{confirmation.request.provider?.name?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{confirmation.request.serviceType?.name}</h3>
                    <p className="text-sm text-gray-500">{confirmation.request.provider?.name}</p>
                  </div>
                </div>
                <Badge className="bg-yellow-500">Esperando confirmación</Badge>
              </div>

              <div className="mb-3 text-sm">
                <p>El profesional marcó este trabajo como completado.</p>
                <p className="text-yellow-600 font-medium">Expira {timeLeft}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => handleConfirm(confirmation.id, true)}
                  disabled={processingId === confirmation.id}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => handleConfirm(confirmation.id, false)}
                  disabled={processingId === confirmation.id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disputar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
