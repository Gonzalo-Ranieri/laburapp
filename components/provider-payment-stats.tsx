"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProviderPaymentStatsProps {
  providerId: string
}

export function ProviderPaymentStats({ providerId }: ProviderPaymentStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/payments/provider-stats?providerId=${providerId}`)
        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    if (providerId) {
      fetchStats()
    }
  }, [providerId])

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Pagos Liberados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats?.releasedAmount.toFixed(2) || "0.00"}</div>
          <p className="text-xs text-gray-500 mt-1">{stats?.releasedCount || 0} pagos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">En Depósito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">${stats?.escrowAmount.toFixed(2) || "0.00"}</div>
          <p className="text-xs text-gray-500 mt-1">{stats?.escrowCount || 0} pagos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Pendientes de Confirmación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            ${stats?.pendingConfirmationAmount.toFixed(2) || "0.00"}
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats?.pendingConfirmationCount || 0} pagos</p>
        </CardContent>
      </Card>
    </div>
  )
}
