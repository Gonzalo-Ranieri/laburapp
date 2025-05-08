// Datos de demostración para la aplicación

// Verificar si estamos en modo de demostración
export function isDemoMode() {
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

// Usuarios de demostración
export const demoUsers = [
  {
    id: "user-123",
    name: "Usuario Demo",
    email: "usuario@test.com",
    password: "Password123!",
    image: "/placeholder.svg?height=40&width=40",
    phone: "+5491112345678",
    providerProfile: null,
  },
  {
    id: "provider-123",
    name: "Proveedor Demo",
    email: "proveedor@test.com",
    password: "Password123!",
    image: "/placeholder.svg?height=40&width=40",
    phone: "+5491187654321",
    providerProfile: {
      id: "provider-profile-123",
      userId: "provider-123",
      serviceTypeId: "service-type-123",
      rating: 4.5,
      reviewCount: 27,
      isAvailable: true,
    },
  },
]

// Servicios de demostración
export const demoServices = [
  {
    id: "service-1",
    name: "Plomería",
    description: "Servicios de plomería y reparaciones",
    categoryId: "category-1",
    providerId: "provider-123",
  },
  {
    id: "service-2",
    name: "Electricidad",
    description: "Instalaciones y reparaciones eléctricas",
    categoryId: "category-2",
    providerId: "provider-123",
  },
]

// Solicitudes de servicio de demostración
export const demoRequests = [
  {
    id: "request-1",
    userId: "user-123",
    providerId: "provider-123",
    serviceId: "service-1",
    status: "pending",
    description: "Reparación de caño bajo mesada",
    location: {
      latitude: -34.603722,
      longitude: -58.381592,
      address: "Av. Corrientes 1234, Buenos Aires",
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
  {
    id: "request-2",
    userId: "user-123",
    providerId: "provider-123",
    serviceId: "service-2",
    status: "accepted",
    description: "Instalación de tomacorrientes",
    location: {
      latitude: -34.606817,
      longitude: -58.370326,
      address: "Av. de Mayo 825, Buenos Aires",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
  },
]

// Reseñas de demostración
export const demoReviews = [
  {
    id: "review-1",
    userId: "user-123",
    providerId: "provider-123",
    serviceId: "service-1",
    rating: 5,
    comment: "Excelente servicio, muy profesional",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
  },
  {
    id: "review-2",
    userId: "user-456",
    providerId: "provider-123",
    serviceId: "service-2",
    rating: 4,
    comment: "Buen trabajo, llegó a tiempo",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
  },
]

// Pagos de demostración
export const demoPayments = [
  {
    id: "payment-1",
    userId: "user-123",
    providerId: "provider-123",
    requestId: "request-1",
    amount: 5000,
    status: "completed",
    paymentMethod: "credit_card",
    createdAt: new Date(Date.now() - 3500000).toISOString(), // 58 minutos atrás
  },
  {
    id: "payment-2",
    userId: "user-123",
    providerId: "provider-123",
    requestId: "request-2",
    amount: 3500,
    status: "pending",
    paymentMethod: "mercado_pago",
    createdAt: new Date(Date.now() - 82800000).toISOString(), // 23 horas atrás
  },
]

// Estadísticas de demostración para proveedores
export const demoProviderStats = {
  totalEarnings: 12500,
  completedServices: 8,
  averageRating: 4.5,
  pendingRequests: 3,
  monthlyEarnings: [
    { month: "Ene", amount: 8000 },
    { month: "Feb", amount: 9500 },
    { month: "Mar", amount: 7500 },
    { month: "Abr", amount: 10000 },
    { month: "May", amount: 12500 },
    { month: "Jun", amount: 9000 },
  ],
}

// Notificaciones de demostración
export const demoNotifications = [
  {
    id: "notification-1",
    userId: "provider-123",
    title: "Nueva solicitud de servicio",
    message: "Has recibido una nueva solicitud de servicio de plomería",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutos atrás
  },
  {
    id: "notification-2",
    userId: "provider-123",
    title: "Pago recibido",
    message: "Has recibido un pago de $5000 por el servicio de plomería",
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
  {
    id: "notification-3",
    userId: "provider-123",
    title: "Nueva reseña",
    message: "Has recibido una nueva reseña de 5 estrellas",
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
  },
]
