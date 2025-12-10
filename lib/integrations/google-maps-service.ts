export class GoogleMapsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY!
    if (!this.apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY no está configurada")
    }
  }

  // Geocodificación: convertir dirección a coordenadas
  async geocode(address: string) {
    try {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        return {
          success: true,
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          address_components: result.address_components,
        }
      }

      return {
        success: false,
        error: `No se pudo geocodificar la dirección: ${data.status}`,
      }
    } catch (error) {
      console.error("Error en geocodificación:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Geocodificación inversa: convertir coordenadas a dirección
  async reverseGeocode(lat: number, lng: number) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        return {
          success: true,
          formatted_address: result.formatted_address,
          address_components: result.address_components,
          place_id: result.place_id,
          location: { lat, lng },
        }
      }

      return {
        success: false,
        error: `No se pudo obtener la dirección: ${data.status}`,
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Calcular distancia entre dos puntos
  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: "driving" | "walking" | "bicycling" | "transit" = "driving",
  ) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0]
        return {
          success: true,
          distance: {
            text: element.distance.text,
            value: element.distance.value, // en metros
          },
          duration: {
            text: element.duration.text,
            value: element.duration.value, // en segundos
          },
          mode,
        }
      }

      return {
        success: false,
        error: `No se pudo calcular la distancia: ${data.status}`,
      }
    } catch (error) {
      console.error("Error calculando distancia:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener direcciones paso a paso
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: "driving" | "walking" | "bicycling" | "transit" = "driving",
    waypoints?: Array<{ lat: number; lng: number }>,
  ) {
    try {
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${this.apiKey}`

      if (waypoints && waypoints.length > 0) {
        const waypointsStr = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join("|")
        url += `&waypoints=${waypointsStr}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0]
        return {
          success: true,
          route: {
            summary: route.summary,
            legs: route.legs,
            overview_polyline: route.overview_polyline,
            bounds: route.bounds,
            copyrights: route.copyrights,
            warnings: route.warnings,
            waypoint_order: route.waypoint_order,
          },
          distance: route.legs.reduce((total: number, leg: any) => total + leg.distance.value, 0),
          duration: route.legs.reduce((total: number, leg: any) => total + leg.duration.value, 0),
        }
      }

      return {
        success: false,
        error: `No se pudieron obtener las direcciones: ${data.status}`,
      }
    } catch (error) {
      console.error("Error obteniendo direcciones:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Buscar lugares cercanos
  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius = 1000, // metros
    type?: string,
    keyword?: string,
  ) {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&key=${this.apiKey}`

      if (type) {
        url += `&type=${type}`
      }

      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return {
          success: true,
          places: data.results.map((place: any) => ({
            place_id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            price_level: place.price_level,
            types: place.types,
            photos: place.photos,
            opening_hours: place.opening_hours,
          })),
          next_page_token: data.next_page_token,
        }
      }

      return {
        success: false,
        error: `No se pudieron buscar lugares: ${data.status}`,
      }
    } catch (error) {
      console.error("Error buscando lugares cercanos:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener detalles de un lugar
  async getPlaceDetails(placeId: string, fields?: string[]) {
    try {
      const fieldsParam = fields
        ? fields.join(",")
        : "name,formatted_address,geometry,rating,formatted_phone_number,opening_hours,website,photos"
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fieldsParam}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return {
          success: true,
          place: data.result,
        }
      }

      return {
        success: false,
        error: `No se pudieron obtener los detalles del lugar: ${data.status}`,
      }
    } catch (error) {
      console.error("Error obteniendo detalles del lugar:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Autocompletar direcciones
  async autocompleteAddress(input: string, location?: { lat: number; lng: number }, radius?: number) {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${this.apiKey}`

      if (location) {
        url += `&location=${location.lat},${location.lng}`
        if (radius) {
          url += `&radius=${radius}`
        }
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return {
          success: true,
          predictions: data.predictions.map((prediction: any) => ({
            place_id: prediction.place_id,
            description: prediction.description,
            structured_formatting: prediction.structured_formatting,
            types: prediction.types,
          })),
        }
      }

      return {
        success: false,
        error: `No se pudieron obtener sugerencias: ${data.status}`,
      }
    } catch (error) {
      console.error("Error en autocompletado:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Validar dirección
  async validateAddress(address: string) {
    try {
      const geocodeResult = await this.geocode(address)

      if (geocodeResult.success) {
        // Verificar que la dirección sea específica (no solo ciudad o país)
        const addressComponents = geocodeResult.address_components
        const hasStreetNumber = addressComponents?.some((component: any) => component.types.includes("street_number"))
        const hasRoute = addressComponents?.some((component: any) => component.types.includes("route"))

        return {
          success: true,
          valid: hasStreetNumber && hasRoute,
          location: geocodeResult.location,
          formatted_address: geocodeResult.formatted_address,
          specificity: hasStreetNumber && hasRoute ? "exact" : "approximate",
        }
      }

      return {
        success: false,
        valid: false,
        error: geocodeResult.error,
      }
    } catch (error) {
      console.error("Error validando dirección:", error)
      return {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Obtener zona horaria
  async getTimezone(lat: number, lng: number, timestamp?: number) {
    try {
      const ts = timestamp || Math.floor(Date.now() / 1000)
      const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return {
          success: true,
          timezone: {
            timeZoneId: data.timeZoneId,
            timeZoneName: data.timeZoneName,
            dstOffset: data.dstOffset,
            rawOffset: data.rawOffset,
          },
        }
      }

      return {
        success: false,
        error: `No se pudo obtener la zona horaria: ${data.status}`,
      }
    } catch (error) {
      console.error("Error obteniendo zona horaria:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Calcular múltiples distancias (matriz)
  async calculateDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: "driving" | "walking" | "bicycling" | "transit" = "driving",
  ) {
    try {
      const originsStr = origins.map((o) => `${o.lat},${o.lng}`).join("|")
      const destinationsStr = destinations.map((d) => `${d.lat},${d.lng}`).join("|")

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=${mode}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return {
          success: true,
          matrix: data.rows.map((row: any, originIndex: number) => ({
            origin: origins[originIndex],
            elements: row.elements.map((element: any, destIndex: number) => ({
              destination: destinations[destIndex],
              distance: element.distance,
              duration: element.duration,
              status: element.status,
            })),
          })),
        }
      }

      return {
        success: false,
        error: `No se pudo calcular la matriz de distancias: ${data.status}`,
      }
    } catch (error) {
      console.error("Error calculando matriz de distancias:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }
}

export const googleMapsService = new GoogleMapsService()
