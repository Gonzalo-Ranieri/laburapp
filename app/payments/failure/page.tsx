"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get("status") || "rejected"
  const paymentId = searchParams.get("payment_id")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Pago no completado</CardTitle>
          <CardDescription>
            {status === "rejected" ? "Tu pago ha sido rechazado" : "Ha ocurrido un problema con tu pago"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center">
            <p className="text-sm text-gray-700">
              {status === "rejected"
                ? "El pago fue rechazado por Mercado Pago. Por favor, intenta con otro método de pago o contacta a tu entidad bancaria."
                : "No se pudo completar el proceso de pago. Por favor, intenta nuevamente más tarde."}
            </p>
            {paymentId && <p className="mt-2 text-xs text-gray-500">Referencia de pago: {paymentId}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => router.push("/active")}>
            Ver mis servicios
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            Volver e intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
