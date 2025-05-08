"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllDemoUsers, getUserFromStorage } from "@/lib/client-only-auth"

export function DebugAuth() {
  const [demoUsers, setDemoUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setDemoUsers(getAllDemoUsers())
    setCurrentUser(getUserFromStorage())
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Depuración de Autenticación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Usuario actual:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {currentUser ? JSON.stringify(currentUser, null, 2) : "No hay usuario autenticado"}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">Usuarios de demostración disponibles:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(demoUsers, null, 2)}</pre>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
          >
            Limpiar localStorage y recargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
