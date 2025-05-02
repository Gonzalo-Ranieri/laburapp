"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface PaymentSummaryProps {
  userId: string
  isProvider?: boolean
}

export function PaymentSummary({ userId, isProvider = false }: PaymentSummaryProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/payments/summary?${isProvider ? "providerId=" : "userId="}${userId}`)

        if (!response.ok) {
          throw new Error("Error al cargar resumen de pagos")
        }

        const data = await response.json()
        setSummary(data)
      } catch (err) {
        console.error("Error al cargar resumen:", err)
        setError(err instanceof Error ? err.message : "Error al cargar resumen")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [userId, isProvider])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {isProvider ? "Ingresos totales" : "Pagos totales"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
            <span className="text-2xl font-bold">${summary?.totalAmount?.toFixed(2) || "0.00"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {isProvider ? "Servicios completados" : "Servicios pagados"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mr-2" />
            <span className="text-2xl font-bold">{summary?.completedCount || 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {isProvider ? "Pagos pendientes" : "Pagos pendientes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-2xl font-bold">{summary?.pendingCount || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
