"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { saveUserToLocalStorage, getUserFromLocalStorage, removeUserFromLocalStorage } from "@/lib/client-auth"

interface User {
  id: string
  name: string
  email: string
  image?: string
  providerProfile?: {
    id: string
    userId: string
    serviceTypeId: string
    rating: number
    reviewCount: number
    isAvailable: boolean
  } | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; redirectUrl?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Función para obtener el usuario actual
  const refreshUser = async () => {
    try {
      setError(null)

      // Primero intentar obtener el usuario de localStorage para una carga rápida
      const localUser = getUserFromLocalStorage()
      if (localUser) {
        console.log("Usuario obtenido de localStorage:", localUser.name)
        setUser(localUser)
      }

      // Luego verificar con el servidor para asegurarnos de que la sesión es válida
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/auth/me?_=${timestamp}`, {
        credentials: "include",
        cache: "no-store", // Evitar caché
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          console.log("Respuesta de /api/auth/me:", data)

          if (data.user) {
            // Guardar el usuario en localStorage para persistencia
            saveUserToLocalStorage(data.user)
            setUser(data.user)
            console.log("Usuario obtenido de la API:", data.user.name)
          } else if (data.authenticated === false) {
            // Si el servidor dice que no estamos autenticados, limpiar el estado
            console.log("No autenticado según el servidor")
            setUser(null)
            removeUserFromLocalStorage()
          }
        }
      } else {
        console.error("Error en respuesta de /api/auth/me:", response.status)
        // No limpiar el usuario aquí, podría ser un error temporal del servidor
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      setError(`Error al cargar usuario: ${error instanceof Error ? error.message : String(error)}`)
      // No limpiar el usuario aquí, podría ser un error temporal
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuario al montar el componente
  useEffect(() => {
    refreshUser()

    // Verificar la sesión cada vez que la ventana recupera el foco
    const handleFocus = () => {
      refreshUser()
    }

    // Verificar la sesión periódicamente (cada 5 minutos)
    const intervalId = setInterval(refreshUser, 5 * 60 * 1000)

    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(intervalId)
    }
  }, [])

  // Función de inicio de sesión
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        cache: "no-store", // Evitar caché
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        return { success: false, message: data.error || "Error al iniciar sesión" }
      }

      // Guardar el usuario en localStorage
      if (data.user) {
        console.log("Guardando usuario en localStorage:", data.user)
        saveUserToLocalStorage(data.user)
        setUser(data.user)
      }

      // Forzar una actualización del estado
      await refreshUser()

      return {
        success: true,
        message: data.message || "Inicio de sesión exitoso",
        redirectUrl: data.redirectUrl,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`Error al iniciar sesión: ${errorMessage}`)
      return { success: false, message: `Error al iniciar sesión: ${errorMessage}` }
    } finally {
      setLoading(false)
    }
  }

  // Función de cierre de sesión
  const logout = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // Limpiar el estado de usuario y localStorage
      setUser(null)
      removeUserFromLocalStorage()

      if (!response.ok) {
        const data = await response.json()
        console.error("Error en API de logout:", data.error)
      }

      // Redirigir a la página de inicio
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setError(`Error al cerrar sesión: ${error instanceof Error ? error.message : String(error)}`)

      // Aún así, limpiar el estado local
      setUser(null)
      removeUserFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
