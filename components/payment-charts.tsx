"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PaymentChartsProps {
  userId: string
  isProvider?: boolean
}

export function PaymentCharts({ userId, isProvider = false }: PaymentChartsProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(
          `/api/payments/charts?${isProvider ? "providerId=" : "userId="}${userId}&period=${period}`,
        )

        if (!response.ok) {
          throw new Error("Error al cargar datos para gráficos")
        }

        const data = await response.json()
        setChartData(data)
      } catch (err) {
        console.error("Error al cargar datos para gráficos:", err)
        setError(err instanceof Error ? err.message : "Error al cargar datos para gráficos")
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [userId, isProvider, period])

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

  // Renderizar gráficos simples basados en los datos
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {isProvider ? "Análisis de ingresos" : "Análisis de gastos"}
        </CardTitle>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="year">Año</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {chartData ? (
          <div className="space-y-4">
            <div className="h-40 w-full">
              {/* Aquí iría un gráfico real, pero para simplificar usamos una representación visual simple */}
              <div className="flex h-full items-end justify-between gap-1">
                {chartData.data.map((item: any, index: number) => (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full bg-emerald-500"
                      style={{
                        height: `${(item.amount / chartData.maxAmount) * 100}%`,
                      }}
                    ></div>
                    <span className="mt-1 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">Total: ${chartData.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">Promedio: ${(chartData.totalAmount / chartData.data.length).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay datos disponibles para este período</p>
        )}
      </CardContent>
    </Card>
  )
}
