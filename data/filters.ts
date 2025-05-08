import type { Filter } from "@/types/categories"

export const filters: Filter[] = [
  {
    id: "location-radius",
    name: "Radio de búsqueda",
    type: "slider",
    min: 1,
    max: 50,
    step: 1,
    unit: "km",
  },
  {
    id: "availability",
    name: "Disponibilidad",
    type: "select",
    options: [
      { id: "any", name: "Cualquier momento", value: "any" },
      { id: "today", name: "Hoy", value: "today" },
      { id: "tomorrow", name: "Mañana", value: "tomorrow" },
      { id: "this-week", name: "Esta semana", value: "this-week" },
      { id: "weekend", name: "Fin de semana", value: "weekend" },
      { id: "specific-date", name: "Fecha específica", value: "specific-date" },
    ],
  },
  {
    id: "price-range",
    name: "Rango de precio",
    type: "range",
    min: 0,
    max: 50000,
    step: 500,
    unit: "$",
  },
  {
    id: "rating",
    name: "Calificación",
    type: "radio",
    options: [
      { id: "any-rating", name: "Cualquier calificación", value: 0 },
      { id: "4-stars", name: "4 estrellas o más", value: 4 },
      { id: "4.5-stars", name: "4.5 estrellas o más", value: 4.5 },
      { id: "5-stars", name: "5 estrellas", value: 5 },
    ],
  },
  {
    id: "payment-method",
    name: "Método de pago",
    type: "multiselect",
    options: [
      { id: "cash", name: "Efectivo", value: "cash" },
      { id: "credit-card", name: "Tarjeta de crédito", value: "credit-card" },
      { id: "debit-card", name: "Tarjeta de débito", value: "debit-card" },
      { id: "transfer", name: "Transferencia bancaria", value: "transfer" },
      { id: "mercado-pago", name: "Mercado Pago", value: "mercado-pago" },
    ],
  },
  {
    id: "certification",
    name: "Certificación profesional",
    type: "toggle",
    options: [{ id: "certified", name: "Solo profesionales certificados", value: true }],
  },
  {
    id: "contact-method",
    name: "Método de contacto preferido",
    type: "select",
    options: [
      { id: "any-contact", name: "Cualquier método", value: "any" },
      { id: "phone", name: "Teléfono", value: "phone" },
      { id: "whatsapp", name: "WhatsApp", value: "whatsapp" },
      { id: "app-chat", name: "Chat en la app", value: "app-chat" },
      { id: "email", name: "Email", value: "email" },
    ],
  },
]
