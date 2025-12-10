import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: "abc",
  },
})

const preference = new Preference(client)
const payment = new Payment(client)

export class MercadoPagoService {
  // Crear preferencia de pago
  async createPreference(orderData: {
    items: Array<{
      title: string
      quantity: number
      unit_price: number
      currency_id?: string
    }>
    payer?: {
      name?: string
      surname?: string
      email?: string
      phone?: {
        area_code?: string
        number?: string
      }
      identification?: {
        type?: string
        number?: string
      }
      address?: {
        street_name?: string
        street_number?: number
        zip_code?: string
      }
    }
    back_urls?: {
      success?: string
      failure?: string
      pending?: string
    }
    notification_url?: string
    external_reference?: string
    auto_return?: "approved" | "all"
    binary_mode?: boolean
    expires?: boolean
    expiration_date_from?: string
    expiration_date_to?: string
  }) {
    try {
      const preferenceData = {
        items: orderData.items.map((item) => ({
          ...item,
          currency_id: item.currency_id || "ARS",
        })),
        payer: orderData.payer,
        back_urls: orderData.back_urls || {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payments/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payments/pending`,
        },
        notification_url: orderData.notification_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        external_reference: orderData.external_reference,
        auto_return: orderData.auto_return || "approved",
        binary_mode: orderData.binary_mode || false,
        expires: orderData.expires || true,
        expiration_date_from: orderData.expiration_date_from,
        expiration_date_to: orderData.expiration_date_to || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        statement_descriptor: "LABURAPP",
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
      }

      const response = await preference.create({ body: preferenceData })

      return {
        success: true,
        preference: response,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
        id: response.id,
      }
    } catch (error) {
      console.error("Error creando preferencia de MercadoPago:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener información de un pago
  async getPayment(paymentId: string) {
    try {
      const paymentInfo = await payment.get({ id: paymentId })

      return {
        success: true,
        payment: paymentInfo,
      }
    } catch (error) {
      console.error("Error obteniendo información del pago:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Procesar webhook de MercadoPago
  async processWebhook(webhookData: any) {
    try {
      const { type, data } = webhookData

      if (type === "payment") {
        const paymentId = data.id
        const paymentInfo = await this.getPayment(paymentId)

        if (paymentInfo.success && paymentInfo.payment) {
          return {
            success: true,
            type: "payment",
            payment: paymentInfo.payment,
            status: paymentInfo.payment.status,
            external_reference: paymentInfo.payment.external_reference,
          }
        }
      }

      return {
        success: false,
        error: "Tipo de webhook no soportado o error procesando",
      }
    } catch (error) {
      console.error("Error procesando webhook:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Crear reembolso
  async createRefund(paymentId: string, amount?: number) {
    try {
      const refundData: any = {
        payment_id: paymentId,
      }

      if (amount) {
        refundData.amount = amount
      }

      // MercadoPago SDK v3 maneja reembolsos a través del objeto Payment
      const response = await payment.refund({
        id: paymentId,
        body: refundData,
      })

      return {
        success: true,
        refund: response,
      }
    } catch (error) {
      console.error("Error creando reembolso:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Cancelar pago
  async cancelPayment(paymentId: string) {
    try {
      const response = await payment.cancel({ id: paymentId })

      return {
        success: true,
        payment: response,
      }
    } catch (error) {
      console.error("Error cancelando pago:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Buscar pagos
  async searchPayments(filters: {
    external_reference?: string
    status?: string
    begin_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) {
    try {
      const searchParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await payment.search({
        options: {
          external_reference: filters.external_reference,
          status: filters.status,
          begin_date: filters.begin_date,
          end_date: filters.end_date,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
        },
      })

      return {
        success: true,
        payments: response.results,
        paging: response.paging,
      }
    } catch (error) {
      console.error("Error buscando pagos:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Validar webhook signature (para seguridad)
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Implementar validación de firma según documentación de MercadoPago
      // Esto es crucial para la seguridad en producción
      const crypto = require("crypto")
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || ""

      const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

      return signature === expectedSignature
    } catch (error) {
      console.error("Error validando firma del webhook:", error)
      return false
    }
  }

  // Obtener métodos de pago disponibles
  async getPaymentMethods() {
    try {
      // En MercadoPago SDK v3, los métodos de pago se obtienen de forma diferente
      const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      })

      const paymentMethods = await response.json()

      return {
        success: true,
        payment_methods: paymentMethods,
      }
    } catch (error) {
      console.error("Error obteniendo métodos de pago:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Crear suscripción (para pagos recurrentes)
  async createSubscription(subscriptionData: {
    reason: string
    auto_recurring: {
      frequency: number
      frequency_type: "days" | "months"
      transaction_amount: number
      currency_id?: string
    }
    payer_email: string
    back_url?: string
  }) {
    try {
      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subscriptionData,
          auto_recurring: {
            ...subscriptionData.auto_recurring,
            currency_id: subscriptionData.auto_recurring.currency_id || "ARS",
          },
        }),
      })

      const subscription = await response.json()

      return {
        success: true,
        subscription,
        init_point: subscription.init_point,
      }
    } catch (error) {
      console.error("Error creando suscripción:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }
}

export const mercadoPagoService = new MercadoPagoService()
