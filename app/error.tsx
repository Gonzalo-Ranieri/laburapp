"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Error global detallado:", error)
    console.error("Error stack:", error.stack)
    console.error("Error digest:", error.digest)

    // Imprimir todas las propiedades del error
    for (const prop in error) {
      console.error(`Error[${prop}]:`, (error as any)[prop])
    }
  }, [error])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Error Global</h1>
      <p className="mb-4">Se ha producido un error en la aplicación.</p>

      <div className="bg-red-100 p-4 rounded mb-4">
        <p className="font-bold">Mensaje de error:</p>
        <p>{error.message}</p>
        {error.stack && (
          <>
            <p className="font-bold mt-2">Stack:</p>
            <pre className="text-xs overflow-auto">{error.stack}</pre>
          </>
        )}
        {error.digest && (
          <>
            <p className="font-bold mt-2">Digest:</p>
            <p>{error.digest}</p>
          </>
        )}
      </div>

      <button onClick={reset} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Intentar de nuevo
      </button>

      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">
          Volver a la página de inicio
        </a>
      </div>
    </div>
  )
}
