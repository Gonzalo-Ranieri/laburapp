"use client"

import { useEffect } from "react"

export default function ProviderMapRedirect() {
  useEffect(() => {
    // Redirigir a la ruta alternativa que funciona
    window.location.href = "/provider-map"
  }, [])

  return (
    <div className="p-8">
      <p>Redirigiendo al mapa de proveedor...</p>
    </div>
  )
}
