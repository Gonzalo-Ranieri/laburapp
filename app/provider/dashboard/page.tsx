import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserFromCookie } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProviderPaymentStats } from "@/components/provider-payment-stats"
import { PaymentHistory } from "@/components/payment-history"
import { Wallet, Clock } from "lucide-react"

export default async function ProviderDashboardPage() {
  const cookieStore = cookies()
  const user = await getUserFromCookie(cookieStore)

  if (!user) {
    redirect("/login")
  }

  // Verificar si el usuario es un proveedor
  const isProvider = user.providerProfile !== null

  if (!isProvider) {
    redirect("/profile")
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Profesional</CardTitle>
          <CardDescription>Gestiona tus servicios, pagos y estadísticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ProviderPaymentStats providerId={user.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/provider/escrow">
                <Button variant="outline" className="w-full h-auto py-4 px-6 justify-start">
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-3 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-medium">Gestionar Pagos en Depósito</p>
                      <p className="text-sm text-gray-500">Ver pagos retenidos y confirmaciones pendientes</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/active">
                <Button variant="outline" className="w-full h-auto py-4 px-6 justify-start">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">Servicios Activos</p>
                      <p className="text-sm text-gray-500">Gestionar tus servicios en curso</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentHistory userId={user.id} isProvider={true} />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
