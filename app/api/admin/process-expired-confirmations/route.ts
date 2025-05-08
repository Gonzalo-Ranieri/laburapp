import { type NextRequest, NextResponse } from "next/server"
import { processExpiredConfirmations } from "@/lib/escrow-worker"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // En producción, aquí verificaríamos si el usuario es administrador
    // Por ahora, permitimos que cualquier usuario autenticado ejecute el worker

    const result = await processExpiredConfirmations()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al procesar confirmaciones expiradas:", error)
    return NextResponse.json({ error: "Error al procesar confirmaciones expiradas" }, { status: 500 })
  }
}
