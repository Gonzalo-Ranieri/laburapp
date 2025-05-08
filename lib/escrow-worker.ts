import prisma from "@/lib/db"

export async function processExpiredConfirmations() {
  try {
    const now = new Date()

    // Buscar confirmaciones expiradas que no han sido confirmadas ni liberadas automáticamente
    const expiredConfirmations = await prisma.taskConfirmation.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        confirmed: false,
        autoReleased: false,
      },
      include: {
        request: {
          include: {
            payment: true,
          },
        },
      },
    })

    console.log(`Encontradas ${expiredConfirmations.length} confirmaciones expiradas`)

    // Procesar cada confirmación expirada
    for (const confirmation of expiredConfirmations) {
      // Marcar como liberada automáticamente
      await prisma.taskConfirmation.update({
        where: { id: confirmation.id },
        data: {
          autoReleased: true,
          autoReleasedAt: now,
        },
      })

      // Liberar el pago si existe
      if (confirmation.request.payment) {
        await prisma.payment.update({
          where: { id: confirmation.request.payment.id },
          data: {
            status: "APPROVED",
            updatedAt: now,
          },
        })
      }

      console.log(`Liberado automáticamente el pago para la confirmación ${confirmation.id}`)
    }

    return {
      processed: expiredConfirmations.length,
      timestamp: now.toISOString(),
    }
  } catch (error) {
    console.error("Error al procesar confirmaciones expiradas:", error)
    throw error
  }
}
