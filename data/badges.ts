import type { ProviderBadge } from "@/types/categories"

export const providerBadges: ProviderBadge[] = [
  {
    id: "identity-verified",
    name: "Identidad Verificada",
    icon: "shield-check",
    description: "Este profesional ha verificado su identidad con documento oficial",
    criteria: {
      type: "verification",
      requirement: "ID verification",
    },
  },
  {
    id: "background-checked",
    name: "Antecedentes Verificados",
    icon: "clipboard-check",
    description: "Este profesional ha pasado una verificación de antecedentes",
    criteria: {
      type: "verification",
      requirement: "Background check",
    },
  },
  {
    id: "certified-professional",
    name: "Profesional Certificado",
    icon: "certificate",
    description: "Cuenta con certificaciones profesionales verificadas",
    criteria: {
      type: "certification",
    },
  },
  {
    id: "top-provider",
    name: "Profesional Destacado",
    icon: "award",
    description: "Entre el top 5% de profesionales en su categoría",
    criteria: {
      type: "topRated",
      threshold: 0.05, // Top 5%
    },
  },
  {
    id: "experienced",
    name: "Experimentado",
    icon: "briefcase",
    description: "Más de 3 años de experiencia verificada",
    criteria: {
      type: "experience",
      threshold: 3, // 3 años
    },
  },
  {
    id: "quick-response",
    name: "Respuesta Rápida",
    icon: "clock",
    description: "Responde a solicitudes en menos de 30 minutos",
    criteria: {
      type: "custom",
      threshold: 30, // 30 minutos
    },
  },
  {
    id: "high-satisfaction",
    name: "Alta Satisfacción",
    icon: "thumbs-up",
    description: "Más del 95% de clientes satisfechos",
    criteria: {
      type: "custom",
      threshold: 0.95, // 95%
    },
  },
]
