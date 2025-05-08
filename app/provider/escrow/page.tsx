import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProviderEscrowPayments } from "@/components/provider-escrow-payments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromCookie } from "@/lib/auth"

export default async function ProviderEscrowPage() {
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
          <CardTitle>Gestión de Pagos</CardTitle>
          <CardDescription>Administra tus pagos en depósito seguro y confirmaciones pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderEscrowPayments providerId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
