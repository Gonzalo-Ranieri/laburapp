import { db } from "@/lib/db"

interface PushNotificationData {
  title: string
  message: string
  data?: any
  icon?: string
  badge?: string
  image?: string
}

interface EmailNotificationData {
  subject: string
  message: string
  data?: any
  template?: string
}

// Servicio de Push Notifications (usando Web Push API)
export async function sendPushNotification(userId: string, notification: PushNotificationData) {
  try {
    // Obtener tokens activos del usuario
    const tokensQuery = `
      SELECT token, platform
      FROM "PushToken"
      WHERE "userId" = $1 AND "isActive" = true
    `
    const tokens = await db.executeQuery(tokensQuery, [userId])

    if (tokens.length === 0) {
      console.log(`No hay tokens activos para el usuario ${userId}`)
      return
    }

    // En una implementación real, aquí usarías un servicio como Firebase Cloud Messaging
    // o Web Push API para enviar las notificaciones
    for (const tokenData of tokens) {
      try {
        // Simular envío de push notification
        console.log(`Enviando push notification a ${tokenData.platform}:`, {
          token: tokenData.token,
          notification,
        })

        // Aquí iría la lógica real de envío
        // await webpush.sendNotification(subscription, JSON.stringify(notification))
      } catch (error) {
        console.error(`Error enviando push a token ${tokenData.token}:`, error)

        // Desactivar token si es inválido
        if (error instanceof Error && error.message.includes("invalid")) {
          await deactivatePushToken(tokenData.token)
        }
      }
    }
  } catch (error) {
    console.error("Error en sendPushNotification:", error)
  }
}

// Servicio de Email Notifications
export async function sendEmailNotification(userId: string, notification: EmailNotificationData) {
  try {
    // Obtener información del usuario
    const userQuery = `
      SELECT email, name
      FROM "User"
      WHERE id = $1
    `
    const userResult = await db.executeQuery(userQuery, [userId])

    if (userResult.length === 0) {
      console.log(`Usuario ${userId} no encontrado`)
      return
    }

    const user = userResult[0]

    // En una implementación real, aquí usarías un servicio como SendGrid, Resend, etc.
    console.log(`Enviando email a ${user.email}:`, {
      to: user.email,
      subject: notification.subject,
      message: notification.message,
      data: notification.data,
    })

    // Aquí iría la lógica real de envío de email
    // await emailService.send({
    //   to: user.email,
    //   subject: notification.subject,
    //   html: generateEmailTemplate(notification, user),
    // })
  } catch (error) {
    console.error("Error en sendEmailNotification:", error)
  }
}

// Función para desactivar tokens inválidos
async function deactivatePushToken(token: string) {
  try {
    const updateQuery = `
      UPDATE "PushToken"
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE token = $1
    `
    await db.executeQuery(updateQuery, [token])
  } catch (error) {
    console.error("Error desactivando token:", error)
  }
}

// Función para crear notificaciones del sistema
export async function createSystemNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data: any = {},
  options: {
    sendPush?: boolean
    sendEmail?: boolean
  } = {},
) {
  try {
    // Crear notificación en la base de datos
    const insertQuery = `
      INSERT INTO "Notification" ("id", "userId", "type", "title", "message", "data")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
      RETURNING id
    `

    const result = await db.executeQuery(insertQuery, [userId, type, title, message, data])
    const notificationId = result[0].id

    // Obtener preferencias del usuario
    const preferencesQuery = `
      SELECT email, push, sms
      FROM "NotificationPreference"
      WHERE "userId" = $1 AND type = $2
    `

    const preferences = await db.executeQuery(preferencesQuery, [userId, type])
    const userPrefs = preferences[0] || { email: false, push: true, sms: false }

    // Enviar notificación push si está habilitada
    if ((options.sendPush ?? true) && userPrefs.push) {
      await sendPushNotification(userId, {
        title,
        message,
        data: { ...data, notificationId },
      })
    }

    // Enviar email si está habilitado
    if ((options.sendEmail ?? false) && userPrefs.email) {
      await sendEmailNotification(userId, {
        subject: title,
        message,
        data: { ...data, notificationId },
      })
    }

    return notificationId
  } catch (error) {
    console.error("Error creando notificación del sistema:", error)
    throw error
  }
}

// Funciones de conveniencia para tipos específicos de notificaciones
export const NotificationHelpers = {
  // Notificación de nueva solicitud de servicio
  async newServiceRequest(providerId: string, requestData: any) {
    return createSystemNotification(
      providerId,
      "REQUEST",
      "Nueva solicitud de servicio",
      `Tienes una nueva solicitud para ${requestData.serviceType}`,
      { requestId: requestData.id, type: "new_request" },
      { sendPush: true, sendEmail: true },
    )
  },

  // Notificación de pago recibido
  async paymentReceived(userId: string, paymentData: any) {
    return createSystemNotification(
      userId,
      "PAYMENT",
      "Pago recibido",
      `Has recibido un pago de $${paymentData.amount}`,
      { paymentId: paymentData.id, type: "payment_received" },
      { sendPush: true, sendEmail: true },
    )
  },

  // Notificación de nueva reseña
  async newReview(providerId: string, reviewData: any) {
    return createSystemNotification(
      providerId,
      "REVIEW",
      "Nueva reseña recibida",
      `Has recibido una calificación de ${reviewData.rating} estrellas`,
      { reviewId: reviewData.id, type: "new_review" },
      { sendPush: true, sendEmail: false },
    )
  },

  // Notificación de nuevo mensaje
  async newMessage(userId: string, messageData: any) {
    return createSystemNotification(
      userId,
      "CHAT",
      "Nuevo mensaje",
      `${messageData.senderName}: ${messageData.content.substring(0, 50)}...`,
      { conversationId: messageData.conversationId, type: "new_message" },
      { sendPush: true, sendEmail: false },
    )
  },

  // Notificación del sistema
  async systemAlert(userId: string, title: string, message: string, data: any = {}) {
    return createSystemNotification(userId, "SYSTEM", title, message, data, { sendPush: true, sendEmail: true })
  },
}
