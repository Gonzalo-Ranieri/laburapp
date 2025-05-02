import { MercadoPagoConfig, Preference } from "mercadopago"

// Configuración de Mercado Pago
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
})

// URLs de redirección
export const MERCADO_PAGO_URLS = {
  success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payments/success`,
  failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payments/failure`,
  pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payments/pending`,
}

// Crear una preferencia de pago
export async function createPaymentPreference({
  items,
  payer,
  externalReference,
  notificationUrl,
}: {
  items: Array<{
    id: string
    title: string
    description: string
    pictureUrl?: string
    categoryId?: string
    quantity: number
    unitPrice: number
    currencyId?: string
  }>
  payer: {
    name: string
    email: string
    phone?: {
      areaCode?: string
      number?: string
    }
    identification?: {
      type?: string
      number?: string
    }
    address?: {
      zipCode?: string
      streetName?: string
      streetNumber?: number
    }
  }
  externalReference: string
  notificationUrl?: string
}) {
  const preference = new Preference(mercadopago)

  const preferenceData = {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      picture_url: item.pictureUrl,
      category_id: item.categoryId || "services",
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: item.currencyId || "ARS",
    })),
    payer: {
      name: payer.name,
      email: payer.email,
      phone: payer.phone,
      identification: payer.identification,
      address: payer.address,
    },
    back_urls: {
      success: MERCADO_PAGO_URLS.success,
      failure: MERCADO_PAGO_URLS.failure,
      pending: MERCADO_PAGO_URLS.pending,
    },
    auto_return: "approved",
    external_reference: externalReference,
    notification_url:
      notificationUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook`,
  }

  const result = await preference.create({ body: preferenceData })
  return result
}

// Verificar el estado de un pago
export async function getPaymentStatus(paymentId: string) {
  const { Payment } = mercadopago
  const payment = new Payment(mercadopago)

  try {
    const result = await payment.get({ id: paymentId })
    return result
  } catch (error) {
    console.error("Error al verificar estado del pago:", error)
    throw error
  }
}
