import { NextResponse } from "next/server"

// Configuración para OpenLayers (no requiere token)
export async function GET() {
  return NextResponse.json({
    mapConfig: {
      defaultCenter: {
        latitude: -34.603722,
        longitude: -58.381592, // Buenos Aires como centro por defecto
      },
      defaultZoom: 14,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      tileLayer: {
        url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
    },
  })
}
