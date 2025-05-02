"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function PaymentPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const paymentId = searchParams.get("payment_id")
  const externalReference = searchParams.get("external_reference")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Pago en proceso</CardTitle>
          <CardDescription>Tu pago está siendo procesado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4 text-center">
            <p className="text-sm text-gray-700">
              El pago está pendiente de confirmación. Esto puede tomar unos minutos.
            </p>
            <p className="mt-2 text-sm text-gray-700">Recibirás una notificación cuando el pago sea confirmado.</p>
            {paymentId && <p className="mt-2 text-xs text-gray-500">Referencia de pago: {paymentId}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/active")}>
            Ver mis servicios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
