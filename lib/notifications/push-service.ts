import { supabaseAdmin } from "../supabase/client"
import { redisService } from "../cache/redis-service"

export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
}

export interface PushSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  deviceType?: "mobile" | "desktop" | "tablet"
  createdAt: Date
  lastUsed: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  title: string
  body: string
  icon?: string
  data?: Record<string, any>
  variables?: string[]
}

class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    subject: process.env.VAPID_SUBJECT || "mailto:admin@laburapp.com",
  }

  private templates: Map<string, NotificationTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: "service_request_new",
        name: "Nueva Solicitud de Servicio",
        title: "Nueva solicitud recibida",
        body: "Tienes una nueva solicitud para {{serviceType}} de {{clientName}}",
        icon: "/icons/service-request.png",
        data: { type: "service_request", action: "view" },
        variables: ["serviceType", "clientName"],
      },
      {
        id: "service_request_accepted",
        name: "Solicitud Aceptada",
        title: "Solicitud aceptada",
        body: "{{providerName}} ha aceptado tu solicitud de {{serviceType}}",
        icon: "/icons/accepted.png",
        data: { type: "service_request", action: "view" },
        variables: ["providerName", "serviceType"],
      },
      {
        id: "service_completed",
        name: "Servicio Completado",
        title: "Servicio completado",
        body: "Tu servicio de {{serviceType}} ha sido completado. ¡Deja una reseña!",
        icon: "/icons/completed.png",
        data: { type: "service_request", action: "review" },
        variables: ["serviceType"],
      },
      {
        id: "payment_received",
        name: "Pago Recibido",
        title: "Pago confirmado",
        body: "Has recibido un pago de ${{amount}} por tu servicio",
        icon: "/icons/payment.png",
        data: { type: "payment", action: "view" },
        variables: ["amount"],
      },
      {
        id: "new_message",
        name: "Nuevo Mensaje",
        title: "Nuevo mensaje de {{senderName}}",
        body: "{{messagePreview}}",
        icon: "/icons/message.png",
        data: { type: "message", action: "view" },
        variables: ["senderName", "messagePreview"],
      },
      {
        id: "reminder_service",
        name: "Recordatorio de Servicio",
        title: "Recordatorio: Servicio programado",
        body: "Tu servicio de {{serviceType}} está programado para {{time}}",
        icon: "/icons/reminder.png",
        data: { type: "reminder", action: "view" },
        variables: ["serviceType", "time"],
      },
    ]

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template)
    })
  }

  // Registrar suscripción push
  async registerSubscription(userId: string, subscription: any, deviceInfo?: any): Promise<boolean> {
    try {
      const pushSubscription: PushSubscription = {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: deviceInfo?.userAgent,
        deviceType: this.detectDeviceType(deviceInfo?.userAgent),
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      // Guardar en base de datos
      const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: pushSubscription.endpoint,
          p256dh_key: pushSubscription.keys.p256dh,
          auth_key: pushSubscription.keys.auth,
          user_agent: pushSubscription.userAgent,
          device_type: pushSubscription.deviceType,
          created_at: pushSubscription.createdAt.toISOString(),
          last_used: pushSubscription.lastUsed.toISOString(),
        },
        {
          onConflict: "user_id,endpoint",
        },
      )

      if (error) {
        console.error("Error registrando suscripción push:", error)
        return false
      }

      // Cachear en Redis para acceso rápido
      await redisService.sadd(`push:subscriptions:${userId}`, pushSubscription)

      console.log(`Push subscription registered for user ${userId}`)
      return true
    } catch (error) {
      console.error("Error en registerSubscription:", error)
      return false
    }
  }

  // Desregistrar suscripción
  async unregisterSubscription(userId: string, endpoint: string): Promise<boolean> {
    try {
      // Eliminar de base de datos
      const { error } = await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", endpoint)

      if (error) {
        console.error("Error desregistrando suscripción:", error)
        return false
      }

      // Eliminar de cache
      const subscriptions = await redisService.smembers<PushSubscription>(`push:subscriptions:${userId}`)
      const filteredSubscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint)

      await redisService.del(`push:subscriptions:${userId}`)
      if (filteredSubscriptions.length > 0) {
        await redisService.sadd(`push:subscriptions:${userId}`, ...filteredSubscriptions)
      }

      console.log(`Push subscription unregistered for user ${userId}`)
      return true
    } catch (error) {
      console.error("Error en unregisterSubscription:", error)
      return false
    }
  }

  // Enviar notificación a usuario específico
  async sendToUser(userId: string, notification: PushNotification): Promise<{ sent: number; failed: number }> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId)

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`)
        return { sent: 0, failed: 0 }
      }

      const results = await Promise.allSettled(
        subscriptions.map((subscription) => this.sendNotification(subscription, notification)),
      )

      const sent = results.filter((result) => result.status === "fulfilled").length
      const failed = results.filter((result) => result.status === "rejected").length

      // Actualizar estadísticas
      await this.updateNotificationStats(userId, sent, failed)

      console.log(`Push notification sent to user ${userId}: ${sent} sent, ${failed} failed`)
      return { sent, failed }
    } catch (error) {
      console.error("Error en sendToUser:", error)
      return { sent: 0, failed: 1 }
    }
  }

  // Enviar notificación usando template
  async sendTemplateToUser(
    userId: string,
    templateId: string,
    variables: Record<string, string> = {},
    additionalData: Record<string, any> = {},
  ): Promise<{ sent: number; failed: number }> {
    try {
      const template = this.templates.get(templateId)
      if (!template) {
        console.error(`Template ${templateId} not found`)
        return { sent: 0, failed: 1 }
      }

      const notification: PushNotification = {
        title: this.replaceVariables(template.title, variables),
        body: this.replaceVariables(template.body, variables),
        icon: template.icon,
        data: { ...template.data, ...additionalData },
        timestamp: Date.now(),
      }

      return await this.sendToUser(userId, notification)
    } catch (error) {
      console.error("Error en sendTemplateToUser:", error)
      return { sent: 0, failed: 1 }
    }
  }

  // Enviar notificación masiva
  async sendBulkNotification(
    userIds: string[],
    notification: PushNotification,
    batchSize = 100,
  ): Promise<{ sent: number; failed: number; total: number }> {
    try {
      let totalSent = 0
      let totalFailed = 0

      // Procesar en lotes para evitar sobrecarga
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)

        const batchResults = await Promise.allSettled(batch.map((userId) => this.sendToUser(userId, notification)))

        for (const result of batchResults) {
          if (result.status === "fulfilled") {
            totalSent += result.value.sent
            totalFailed += result.value.failed
          } else {
            totalFailed += 1
          }
        }

        // Pequeña pausa entre lotes para no sobrecargar
        if (i + batchSize < userIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      console.log(`Bulk notification sent: ${totalSent} sent, ${totalFailed} failed, ${userIds.length} total`)
      return { sent: totalSent, failed: totalFailed, total: userIds.length }
    } catch (error) {
      console.error("Error en sendBulkNotification:", error)
      return { sent: 0, failed: userIds.length, total: userIds.length }
    }
  }

  // Enviar notificación por segmento de usuarios
  async sendToSegment(
    segmentQuery: any,
    notification: PushNotification,
  ): Promise<{ sent: number; failed: number; total: number }> {
    try {
      // Obtener usuarios del segmento
      const { data: users, error } = await supabaseAdmin.from("users").select("id").match(segmentQuery)

      if (error) {
        console.error("Error obteniendo usuarios del segmento:", error)
        return { sent: 0, failed: 0, total: 0 }
      }

      const userIds = users?.map((user) => user.id) || []
      return await this.sendBulkNotification(userIds, notification)
    } catch (error) {
      console.error("Error en sendToSegment:", error)
      return { sent: 0, failed: 0, total: 0 }
    }
  }

  // Programar notificación
  async scheduleNotification(
    userId: string,
    notification: PushNotification,
    scheduledFor: Date,
  ): Promise<string | null> {
    try {
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const scheduledNotification = {
        id: scheduleId,
        userId,
        notification,
        scheduledFor: scheduledFor.toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Guardar en base de datos
      const { error } = await supabaseAdmin.from("scheduled_notifications").insert({
        id: scheduleId,
        user_id: userId,
        notification_data: notification,
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error programando notificación:", error)
        return null
      }

      // Programar en Redis con TTL
      const delay = scheduledFor.getTime() - Date.now()
      if (delay > 0) {
        await redisService.set(`scheduled:${scheduleId}`, scheduledNotification, Math.ceil(delay / 1000))
      }

      console.log(`Notification scheduled for user ${userId} at ${scheduledFor.toISOString()}`)
      return scheduleId
    } catch (error) {
      console.error("Error en scheduleNotification:", error)
      return null
    }
  }

  // Cancelar notificación programada
  async cancelScheduledNotification(scheduleId: string): Promise<boolean> {
    try {
      // Actualizar en base de datos
      const { error } = await supabaseAdmin
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", scheduleId)

      if (error) {
        console.error("Error cancelando notificación programada:", error)
        return false
      }

      // Eliminar de Redis
      await redisService.del(`scheduled:${scheduleId}`)

      console.log(`Scheduled notification ${scheduleId} cancelled`)
      return true
    } catch (error) {
      console.error("Error en cancelScheduledNotification:", error)
      return false
    }
  }

  // Procesar notificaciones programadas
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date()

      // Obtener notificaciones que deben enviarse
      const { data: notifications, error } = await supabaseAdmin
        .from("scheduled_notifications")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", now.toISOString())
        .limit(100)

      if (error) {
        console.error("Error obteniendo notificaciones programadas:", error)
        return
      }

      if (!notifications || notifications.length === 0) {
        return
      }

      console.log(`Processing ${notifications.length} scheduled notifications`)

      for (const notification of notifications) {
        try {
          const result = await this.sendToUser(notification.user_id, notification.notification_data)

          // Actualizar estado
          await supabaseAdmin
            .from("scheduled_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              sent_count: result.sent,
              failed_count: result.failed,
            })
            .eq("id", notification.id)

          // Limpiar de Redis
          await redisService.del(`scheduled:${notification.id}`)
        } catch (error) {
          console.error(`Error enviando notificación programada ${notification.id}:`, error)

          // Marcar como fallida
          await supabaseAdmin
            .from("scheduled_notifications")
            .update({
              status: "failed",
              error_message: error instanceof Error ? error.message : "Unknown error",
            })
            .eq("id", notification.id)
        }
      }
    } catch (error) {
      console.error("Error en processScheduledNotifications:", error)
    }
  }

  // Obtener suscripciones de usuario
  private async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      // Intentar obtener de cache primero
      const cached = await redisService.smembers<PushSubscription>(`push:subscriptions:${userId}`)
      if (cached.length > 0) {
        return cached
      }

      // Obtener de base de datos
      const { data, error } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true)

      if (error) {
        console.error("Error obteniendo suscripciones:", error)
        return []
      }

      const subscriptions: PushSubscription[] =
        data?.map((row) => ({
          userId: row.user_id,
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh_key,
            auth: row.auth_key,
          },
          userAgent: row.user_agent,
          deviceType: row.device_type,
          createdAt: new Date(row.created_at),
          lastUsed: new Date(row.last_used),
        })) || []

      // Cachear para próximas consultas
      if (subscriptions.length > 0) {
        await redisService.sadd(`push:subscriptions:${userId}`, ...subscriptions)
        await redisService.expire(`push:subscriptions:${userId}`, 3600) // 1 hora
      }

      return subscriptions
    } catch (error) {
      console.error("Error en getUserSubscriptions:", error)
      return []
    }
  }

  // Enviar notificación individual
  private async sendNotification(subscription: PushSubscription, notification: PushNotification): Promise<void> {
    try {
      const webpush = require("web-push")

      webpush.setVapidDetails(this.vapidKeys.subject, this.vapidKeys.publicKey, this.vapidKeys.privateKey)

      const payload = JSON.stringify(notification)

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload,
      )

      // Actualizar última vez usado
      await this.updateSubscriptionLastUsed(subscription.userId, subscription.endpoint)
    } catch (error) {
      console.error("Error enviando notificación push:", error)

      // Si la suscripción es inválida, eliminarla
      if (error.statusCode === 410 || error.statusCode === 404) {
        await this.unregisterSubscription(subscription.userId, subscription.endpoint)
      }

      throw error
    }
  }

  // Actualizar última vez usado de suscripción
  private async updateSubscriptionLastUsed(userId: string, endpoint: string): Promise<void> {
    try {
      await supabaseAdmin
        .from("push_subscriptions")
        .update({ last_used: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("endpoint", endpoint)
    } catch (error) {
      console.error("Error actualizando última vez usado:", error)
    }
  }

  // Detectar tipo de dispositivo
  private detectDeviceType(userAgent?: string): "mobile" | "desktop" | "tablet" {
    if (!userAgent) return "desktop"

    const ua = userAgent.toLowerCase()

    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return "mobile"
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return "tablet"
    } else {
      return "desktop"
    }
  }

  // Reemplazar variables en templates
  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g")
      result = result.replace(regex, value)
    }

    return result
  }

  // Actualizar estadísticas de notificaciones
  private async updateNotificationStats(userId: string, sent: number, failed: number): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const statsKey = `push:stats:${userId}:${today}`

      await redisService.hset(statsKey, "sent", sent)
      await redisService.hset(statsKey, "failed", failed)
      await redisService.expire(statsKey, 86400 * 30) // 30 días
    } catch (error) {
      console.error("Error actualizando estadísticas:", error)
    }
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(
    userId: string,
    days = 7,
  ): Promise<{
    totalSent: number
    totalFailed: number
    dailyStats: Array<{ date: string; sent: number; failed: number }>
  }> {
    try {
      const dailyStats = []
      let totalSent = 0
      let totalFailed = 0

      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const statsKey = `push:stats:${userId}:${dateStr}`
        const sent = (await redisService.hget<number>(statsKey, "sent")) || 0
        const failed = (await redisService.hget<number>(statsKey, "failed")) || 0

        dailyStats.unshift({ date: dateStr, sent, failed })
        totalSent += sent
        totalFailed += failed
      }

      return { totalSent, totalFailed, dailyStats }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error)
      return { totalSent: 0, totalFailed: 0, dailyStats: [] }
    }
  }

  // Gestión de templates
  addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
  }

  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId)
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId)
  }

  // Limpiar suscripciones inactivas
  async cleanupInactiveSubscriptions(daysInactive = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive)

      const { data, error } = await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .lt("last_used", cutoffDate.toISOString())

      if (error) {
        console.error("Error limpiando suscripciones inactivas:", error)
        return 0
      }

      const deletedCount = data?.length || 0
      console.log(`Cleaned up ${deletedCount} inactive push subscriptions`)

      return deletedCount
    } catch (error) {
      console.error("Error en cleanupInactiveSubscriptions:", error)
      return 0
    }
  }
}

export const pushNotificationService = new PushNotificationService()

// Procesar notificaciones programadas cada minuto
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    await pushNotificationService.processScheduledNotifications()
  }, 60000) // 1 minuto

  // Limpiar suscripciones inactivas diariamente
  setInterval(
    async () => {
      await pushNotificationService.cleanupInactiveSubscriptions()
    },
    24 * 60 * 60 * 1000,
  ) // 24 horas
}
