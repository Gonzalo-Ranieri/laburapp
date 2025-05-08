import type { DynamicTag } from "@/types/categories"

export const dynamicTags: DynamicTag[] = [
  {
    id: "highly-rated",
    name: "Altamente valorado",
    icon: "star",
    backgroundColor: "#FEF3C7",
    textColor: "#92400E",
    criteria: {
      type: "rating",
      threshold: 4.8,
    },
  },
  {
    id: "new-on-app",
    name: "Nuevo en la app",
    icon: "sparkles",
    backgroundColor: "#DBEAFE",
    textColor: "#1E40AF",
    criteria: {
      type: "newProvider",
      timeFrame: 30, // Menos de 30 días en la plataforma
    },
  },
  {
    id: "fast-responder",
    name: "Respuesta rápida",
    icon: "zap",
    backgroundColor: "#D1FAE5",
    textColor: "#065F46",
    criteria: {
      type: "responseTime",
      threshold: 15, // Responde en menos de 15 minutos en promedio
    },
  },
  {
    id: "top-rated",
    name: "Top 10%",
    icon: "award",
    backgroundColor: "#FEE2E2",
    textColor: "#991B1B",
    criteria: {
      type: "rating",
      threshold: 4.9, // En el top 10% de proveedores por calificación
    },
  },
  {
    id: "verified-pro",
    name: "Profesional verificado",
    icon: "check-circle",
    backgroundColor: "#E0E7FF",
    textColor: "#3730A3",
    criteria: {
      type: "custom",
      // Verificación manual por el equipo de LaburApp
    },
  },
  {
    id: "high-completion",
    name: "Alta tasa de finalización",
    icon: "check",
    backgroundColor: "#F3E8FF",
    textColor: "#6B21A8",
    criteria: {
      type: "completionRate",
      threshold: 0.95, // 95% o más de trabajos completados
    },
  },
]
