"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentSummary } from "./payment-summary"
import { PaymentHistory } from "./payment-history"
import { PaymentStats } from "./payment-stats"
import { PaymentCharts } from "./payment-charts"

interface PaymentDashboardProps {
  userId: string
  isProvider?: boolean
}

export function PaymentDashboard({ userId, isProvider = false }: PaymentDashboardProps) {
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{isProvider ? "Panel de Ingresos" : "Panel de Pagos"}</h2>

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <PaymentSummary userId={userId} isProvider={isProvider} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <PaymentHistory userId={userId} isProvider={isProvider} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-6">
          <PaymentStats userId={userId} isProvider={isProvider} />
          <PaymentCharts userId={userId} isProvider={isProvider} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
