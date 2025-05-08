import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { PendingConfirmations } from "@/components/pending-confirmations"

interface JwtPayload {
  id: string
  email: string
}

export default function ConfirmationsPage() {
  // Verificar autenticación
  const token = cookies().get("token")?.value
  if (!token) {
    redirect("/login")
  }

  let userId: string
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload
    userId = decoded.id
  } catch (error) {
    redirect("/login")
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Confirmaciones Pendientes</h1>
      <PendingConfirmations userId={userId} />

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
        <p className="text-sm text-blue-700 mb-2">
          Cuando un profesional marca un trabajo como completado, tienes 48 horas para confirmar que estás satisfecho
          con el servicio.
        </p>
        <p className="text-sm text-blue-700 mb-2">
          Si confirmas, el pago que está retenido se liberará al profesional.
        </p>
        <p className="text-sm text-blue-700">Si no respondes en 48 horas, el pago se liberará automáticamente.</p>
      </div>
    </div>
  )
}
