import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT"
}

export class NotificationService {
  // Crear notificación en base de datos
  static async createNotification(notificationData: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          priority: notificationData.priority || "NORMAL",
        },
      })

      // Enviar push notification si es necesario
      if (notificationData.priority === "HIGH" || notificationData.priority === "URGENT") {
        await this.sendPushNotification(notification)
      }

      return notification
    } catch (error) {
      console.error("Error creando notificación:", error)
      throw error
    }
  }

  // Enviar push notification (integración con servicios externos)
  static async sendPushNotification(notification: any) {
    try {
      // Aquí integrarías con servicios como Firebase, OneSignal, etc.
      console.log("Enviando push notification:", notification.title)

      // Ejemplo de integración con Firebase (comentado)
      /*
      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: notification.data,
        token: userPushToken, // Obtenido de la base de datos
      };

      await admin.messaging().send(message);
      */
    } catch (error) {
      console.error("Error enviando push notification:", error)
    }
  }

  // Notificaciones específicas del sistema
  static async notifyNewServiceRequest(providerId: string, requestData: any) {
    return await this.createNotification({
      userId: providerId,
      type: "SERVICE_REQUEST",
      title: "Nueva solicitud de servicio",
      message: `Tienes una nueva solicitud para ${requestData.serviceType.name}`,
      data: {
        requestId: requestData.id,
        serviceType: requestData.serviceType.name,
        clientName: requestData.client.name,
      },
      priority: "HIGH",
    })
  }

  static async notifyRequestAccepted(clientId: string, requestData: any) {
    return await this.createNotification({
      userId: clientId,
      type: "REQUEST_ACCEPTED",
      title: "Solicitud aceptada",
      message: `${requestData.provider.name} ha aceptado tu solicitud`,
      data: {
        requestId: requestData.id,
        providerName: requestData.provider.name,
        serviceType: requestData.serviceType.name,
      },
      priority: "HIGH",
    })
  }

  static async notifyServiceCompleted(clientId: string, requestData: any) {
    return await this.createNotification({
      userId: clientId,
      type: "SERVICE_COMPLETED",
      title: "Servicio completado",
      message: `Tu servicio de ${requestData.serviceType.name} ha sido completado`,
      data: {
        requestId: requestData.id,
        providerName: requestData.provider.name,
        canReview: true,
      },
      priority: "NORMAL",
    })
  }

  static async notifyPaymentReceived(providerId: string, paymentData: any) {
    return await this.createNotification({
      userId: providerId,
      type: "PAYMENT_RECEIVED",
      title: "Pago recibido",
      message: `Has recibido un pago de $${paymentData.amount}`,
      data: {
        paymentId: paymentData.id,
        amount: paymentData.amount,
        requestId: paymentData.requestId,
      },
      priority: "NORMAL",
    })
  }

  static async notifyNewReview(providerId: string, reviewData: any) {
    return await this.createNotification({
      userId: providerId,
      type: "NEW_REVIEW",
      title: "Nueva reseña recibida",
      message: `Has recibido una calificación de ${reviewData.rating} estrellas`,
      data: {
        reviewId: reviewData.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
      priority: "NORMAL",
    })
  }

  // Obtener estadísticas de notificaciones
  static async getNotificationStats(userId: string) {
    try {
      const [total, unread, byType] = await Promise.all([
        prisma.notification.count({
          where: { userId },
        }),
        prisma.notification.count({
          where: { userId, readAt: null },
        }),
        prisma.notification.groupBy({
          by: ["type"],
          where: { userId },
          _count: { type: true },
        }),
      ])

      return {
        total,
        unread,
        byType: byType.reduce(
          (acc, item) => {
            acc[item.type] = item._count.type
            return acc
          },
          {} as Record<string, number>,
        ),
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas de notificaciones:", error)
      throw error
    }
  }

  // Limpiar notificaciones antiguas
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          readAt: { not: null }, // Solo eliminar las ya leídas
        },
      })

      console.log(`Eliminadas ${result.count} notificaciones antiguas`)
      return result.count
    } catch (error) {
      console.error("Error limpiando notificaciones:", error)
      throw error
    }
  }
}
