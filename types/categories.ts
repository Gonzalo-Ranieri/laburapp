export interface Category {
  id: string
  name: string
  icon: string
  description: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  icon?: string
  description: string
  requiresCertification: boolean
  certificationTypes?: string[]
}

export interface Filter {
  id: string
  name: string
  type: "range" | "select" | "multiselect" | "toggle" | "radio" | "slider"
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

export interface FilterOption {
  id: string
  name: string
  value: string | number | boolean
}

export interface DynamicTag {
  id: string
  name: string
  icon?: string
  backgroundColor: string
  textColor: string
  criteria: {
    type: "rating" | "responseTime" | "completionRate" | "newProvider" | "custom"
    threshold?: number
    timeFrame?: number // en días
  }
}

export interface ProviderBadge {
  id: string
  name: string
  icon: string
  description: string
  criteria: {
    type: "verification" | "experience" | "certification" | "topRated" | "custom"
    threshold?: number
    requirement?: string
  }
}
