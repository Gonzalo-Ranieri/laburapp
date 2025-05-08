"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Star, Navigation, Layers, ZoomIn, ZoomOut } from "lucide-react"
import Link from "next/link"

/**
 * Componente de vista de mapa para proveedores
 *
 * Muestra un mapa interactivo con marcadores para las solicitudes cercanas
 */
export function ProviderMapView({ providerId }: { providerId: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Cargar OpenLayers y configurar el mapa
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      // Generar 15 solicitudes de ejemplo con ubicaciones aleatorias
      const mockRequests = Array.from({ length: 15 }, (_, i) => ({
        id: `req-${i + 1}`.padStart(6, "0"),
        title: [
          "Reparación de cañería",
          "Instalación eléctrica",
          "Pintura de interiores",
          "Reparación de aire acondicionado",
          "Instalación de muebles",
          "Limpieza de terreno",
          "Reparación de techo",
          "Instalación de pisos",
          "Construcción de pared",
          "Reparación de electrodomésticos",
        ][i % 10],
        category: [
          "Plomería",
          "Electricidad",
          "Pintura",
          "Climatización",
          "Carpintería",
          "Jardinería",
          "Techista",
          "Pisos",
          "Albañilería",
          "Técnico",
        ][i % 10],
        description: "Necesito un profesional con experiencia para realizar este trabajo lo antes posible.",
        budget: Math.floor(Math.random() * 30000) + 5000,
        distance: Math.floor(Math.random() * 50) / 10 + 0.5,
        timePosted: [
          "Hace 10 minutos",
          "Hace 30 minutos",
          "Hace 1 hora",
          "Hace 2 horas",
          "Hace 3 horas",
          "Hace 5 horas",
          "Hace 8 horas",
          "Hace 12 horas",
          "Hace 1 día",
          "Hace 2 días",
        ][i % 10],
        urgency: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        client: {
          id: `client-${i + 1}`.padStart(6, "0"),
          name: [
            "María García",
            "Carlos López",
            "Laura Martínez",
            "Juan Rodríguez",
            "Ana Fernández",
            "Pedro Sánchez",
            "Lucía González",
            "Miguel Torres",
            "Sofía Ramírez",
            "Diego Díaz",
          ][i % 10],
          rating: (Math.floor(Math.random() * 10) + 35) / 10,
          image: null,
        },
        location: {
          address: "Av. Corrientes 1234, CABA",
          coordinates: [-34.603722 + (Math.random() * 0.1 - 0.05), -58.381592 + (Math.random() * 0.1 - 0.05)],
        },
      }))

      setRequests(mockRequests)
      setLoading(false)

      // Simular ubicación del usuario
      setUserLocation([-34.603722, -58.381592])
    }, 1500)

    return () => clearTimeout(timer)
  }, [providerId])

  // Inicializar el mapa cuando se carga OpenLayers
  useEffect(() => {
    if (!mapRef.current || loading || !userLocation) return

    // Importar OpenLayers dinámicamente
    import("ol/Map").then(({ default: Map }) => {
      import("ol/View").then(({ default: View }) => {
        import("ol/layer/Tile").then(({ default: TileLayer }) => {
          import("ol/source/OSM").then(({ default: OSM }) => {
            import("ol/layer/Vector").then(({ default: VectorLayer }) => {
              import("ol/source/Vector").then(({ default: VectorSource }) => {
                import("ol/Feature").then(({ default: Feature }) => {
                  import("ol/geom/Point").then(({ default: Point }) => {
                    import("ol/style/Style").then(({ default: Style }) => {
                      import("ol/style/Icon").then(({ default: Icon }) => {
                        import("ol/style/Text").then(({ default: Text }) => {
                          import("ol/style/Fill").then(({ default: Fill }) => {
                            import("ol/style/Stroke").then(({ default: Stroke }) => {
                              import("ol/proj").then(({ fromLonLat }) => {
                                // Crear fuente de vectores para los marcadores
                                const vectorSource = new VectorSource()

                                // Añadir marcador para la ubicación del usuario
                                const userFeature = new Feature({
                                  geometry: new Point(fromLonLat([userLocation[1], userLocation[0]])),
                                  type: "user",
                                })

                                userFeature.setStyle(
                                  new Style({
                                    image: new Icon({
                                      src: "/placeholder.svg?height=32&width=32",
                                      scale: 0.75,
                                      anchor: [0.5, 0.5],
                                    }),
                                    text: new Text({
                                      text: "Tú",
                                      offsetY: 20,
                                      fill: new Fill({ color: "#1d4ed8" }),
                                      stroke: new Stroke({ color: "#fff", width: 2 }),
                                    }),
                                  }),
                                )

                                vectorSource.addFeature(userFeature)

                                // Añadir marcadores para las solicitudes
                                requests.forEach((request, index) => {
                                  const { coordinates } = request.location
                                  const feature = new Feature({
                                    geometry: new Point(fromLonLat([coordinates[1], coordinates[0]])),
                                    properties: request,
                                    type: "request",
                                    id: request.id,
                                  })

                                  // Estilo basado en la urgencia
                                  let markerColor = "#22c55e" // verde para normal
                                  if (request.urgency === "high") {
                                    markerColor = "#ef4444" // rojo para urgente
                                  } else if (request.urgency === "medium") {
                                    markerColor = "#f59e0b" // ámbar para prioritario
                                  }

                                  feature.setStyle(
                                    new Style({
                                      image: new Icon({
                                        src: "/placeholder.svg?height=32&width=32",
                                        scale: 0.6,
                                        anchor: [0.5, 0.5],
                                        color: markerColor,
                                      }),
                                      text: new Text({
                                        text: `$${request.budget.toLocaleString()}`,
                                        offsetY: 20,
                                        fill: new Fill({ color: "#1f2937" }),
                                        stroke: new Stroke({ color: "#fff", width: 2 }),
                                      }),
                                    }),
                                  )

                                  vectorSource.addFeature(feature)
                                })

                                // Crear capa de vectores
                                const vectorLayer = new VectorLayer({
                                  source: vectorSource,
                                })

                                // Crear mapa
                                const olMap = new Map({
                                  target: mapRef.current,
                                  layers: [
                                    new TileLayer({
                                      source: new OSM(),
                                    }),
                                    vectorLayer,
                                  ],
                                  view: new View({
                                    center: fromLonLat([userLocation[1], userLocation[0]]),
                                    zoom: 14,
                                  }),
                                })

                                // Manejar clics en el mapa
                                olMap.on("click", (event) => {
                                  const feature = olMap.forEachFeatureAtPixel(event.pixel, (feature) => feature)

                                  if (feature && feature.get("type") === "request") {
                                    setSelectedRequest(feature.get("properties"))
                                  } else {
                                    setSelectedRequest(null)
                                  }
                                })

                                setMap(olMap)
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })

    return () => {
      if (map) {
        map.setTarget(undefined)
      }
    }
  }, [loading, userLocation, requests])

  // Manejar zoom
  const handleZoom = (direction: "in" | "out") => {
    if (!map) return

    const view = map.getView()
    const zoom = view.getZoom()
    view.animate({
      zoom: direction === "in" ? zoom + 1 : zoom - 1,
      duration: 250,
    })
  }

  // Centrar en la ubicación del usuario
  const centerOnUser = () => {
    if (!map || !userLocation) return

    import("ol/proj").then(({ fromLonLat }) => {
      map.getView().animate({
        center: fromLonLat([userLocation[1], userLocation[0]]),
        zoom: 14,
        duration: 500,
      })
    })
  }

  return (
    <div className="relative h-[70vh] md:h-[80vh]">
      {loading ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="h-full w-full"></div>

          {/* Controles del mapa */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 bg-white shadow-md hover:bg-gray-100"
              onClick={() => handleZoom("in")}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 bg-white shadow-md hover:bg-gray-100"
              onClick={() => handleZoom("out")}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 bg-white shadow-md hover:bg-gray-100"
              onClick={centerOnUser}
            >
              <Navigation className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-10 w-10 bg-white shadow-md hover:bg-gray-100">
              <Layers className="h-5 w-5" />
            </Button>
          </div>

          {/* Información de solicitud seleccionada */}
          {selectedRequest && (
            <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 shadow-lg">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{selectedRequest.title}</h3>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          selectedRequest.urgency === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : selectedRequest.urgency === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-green-50 text-green-700 border-green-200"
                        }
                      `}
                    >
                      {selectedRequest.urgency === "high"
                        ? "Urgente"
                        : selectedRequest.urgency === "medium"
                          ? "Prioritario"
                          : "Normal"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-1"
                    onClick={() => setSelectedRequest(null)}
                  >
                    &times;
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedRequest.distance} km</span>
                  <span className="mx-1">•</span>
                  <Clock className="h-4 w-4" />
                  <span>{selectedRequest.timePosted}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <DollarSign className="h-4 w-4" />
                  <span>${selectedRequest.budget.toLocaleString()}</span>
                </div>

                <div className="flex items-center mb-4">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage
                      src={selectedRequest.client.image || "/placeholder.svg?height=24&width=24"}
                      alt={selectedRequest.client.name}
                    />
                    <AvatarFallback>{selectedRequest.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <span className="text-xs mr-1">{selectedRequest.client.name}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-xs">{selectedRequest.client.rating}</span>
                  </div>
                </div>

                <Link href={`/provider/requests/${selectedRequest.id}`}>
                  <Button className="w-full">Ver detalles</Button>
                </Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
