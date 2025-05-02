"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, Calendar } from "lucide-react"

interface PaymentStatsProps {
  userId: string
  isProvider?: boolean
  period?: "week" | "month" | "year" | "all"
}

export function PaymentStats({ userId, isProvider = false, period = "month" }: PaymentStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(
          `/api/payments/stats?${isProvider ? "providerId=" : "userId="}${userId}&period=${period}`,
        )

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas de pagos")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error al cargar estadísticas:", err)
        setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, isProvider, period])

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {isProvider ? "Ingresos este mes" : "Gastos este mes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-emerald-500 mr-2" />
            <span className="text-2xl font-bold">${stats?.currentMonthAmount?.toFixed(2) || "0.00"}</span>
            {stats?.monthlyChange !== undefined && (
              <span className={`ml-2 text-xs ${stats.monthlyChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.monthlyChange >= 0 ? "+" : ""}
                {stats.monthlyChange.toFixed(2)}%
              </span>
            )}
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
            <Calendar className="h-5 w-5 text-emerald-500 mr-2" />
            <span className="text-2xl font-bold">{stats?.completedCount || 0}</span>
            {stats?.completedChange !== undefined && (
              <span className={`ml-2 text-xs ${stats.completedChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.completedChange >= 0 ? "+" : ""}
                {stats.completedChange.toFixed(2)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
