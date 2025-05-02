// Configuración para OpenLayers
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Configuración por defecto para el mapa
export const DEFAULT_MAP_CENTER = {
  latitude: -34.603722,
  longitude: -58.381592, // Buenos Aires como centro por defecto
}

// Zoom por defecto
export const DEFAULT_ZOOM = 14

// Calcular distancia entre dos puntos (fórmula de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distancia en km
  return distance
}

// Estimar tiempo de llegada basado en la distancia
export function estimateArrivalTime(distanceKm: number): string {
  // Asumiendo una velocidad promedio de 30 km/h en ciudad
  const timeHours = distanceKm / 30

  if (timeHours < 1 / 60) {
    return "Menos de 1 minuto"
  } else if (timeHours < 1) {
    const minutes = Math.round(timeHours * 60)
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
  } else {
    const hours = Math.floor(timeHours)
    const minutes = Math.round((timeHours - hours) * 60)
    return `${hours} ${hours === 1 ? "hora" : "horas"}${minutes > 0 ? ` y ${minutes} ${minutes === 1 ? "minuto" : "minutos"}` : ""}`
  }
}
