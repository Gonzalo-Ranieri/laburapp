"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Clock, Star, Users } from "lucide-react"

/**
 * Componente de estadísticas para proveedores
 *
 * Muestra métricas clave como ganancias, trabajos completados,
 * calificación promedio y clientes atendidos
 */
export function ProviderStats({ providerId }: { providerId: string }) {
  const [stats, setStats] = useState({
    earnings: { value: 0, trend: 0 },
    completedJobs: { value: 0, trend: 0 },
    rating: { value: 0, trend: 0 },
    clients: { value: 0, trend: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setStats({
        earnings: { value: 12580, trend: 12 },
        completedJobs: { value: 48, trend: 5 },
        rating: { value: 4.8, trend: 2 },
        clients: { value: 32, trend: 8 },
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [providerId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Ganancias Totales"
        value={formatCurrency(stats.earnings.value)}
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
        trend={stats.earnings.trend}
        loading={loading}
        bgColor="bg-green-50"
        textColor="text-green-700"
      />

      <StatCard
        title="Trabajos Completados"
        value={stats.completedJobs.value.toString()}
        icon={<Clock className="h-5 w-5 text-blue-600" />}
        trend={stats.completedJobs.trend}
        loading={loading}
        bgColor="bg-blue-50"
        textColor="text-blue-700"
      />

      <StatCard
        title="Calificación Promedio"
        value={stats.rating.value.toFixed(1)}
        icon={<Star className="h-5 w-5 text-amber-600" />}
        trend={stats.rating.trend}
        loading={loading}
        bgColor="bg-amber-50"
        textColor="text-amber-700"
      />

      <StatCard
        title="Clientes Atendidos"
        value={stats.clients.value.toString()}
        icon={<Users className="h-5 w-5 text-indigo-600" />}
        trend={stats.clients.trend}
        loading={loading}
        bgColor="bg-indigo-50"
        textColor="text-indigo-700"
      />
    </div>
  )
}

/**
 * Tarjeta individual de estadística
 */
function StatCard({
  title,
  value,
  icon,
  trend,
  loading,
  bgColor,
  textColor,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend: number
  loading: boolean
  bgColor: string
  textColor: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
          </div>
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>{icon}</div>
        </div>
        {!loading && (
          <div className="mt-4 flex items-center">
            <span className={`text-xs font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
