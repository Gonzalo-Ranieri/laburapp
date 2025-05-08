"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        })
        const data = await res.json()

        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Error verificando autenticación:", err)
        setError("Error al verificar autenticación")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de autenticación</CardTitle>
        </CardHeader>
        <CardContent>Cargando...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de autenticación</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {user ? (
          <div className="space-y-4">
            <p>
              <strong>Autenticado como:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Rol:</strong> {user.isProvider ? "Proveedor" : "Usuario"}
            </p>
            <Button onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>No autenticado</p>
            <Button onClick={() => router.push("/login")}>Iniciar sesión</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
