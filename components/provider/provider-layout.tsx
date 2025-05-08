"use client"

import type React from "react"

import { ProviderNavigation } from "@/components/provider/provider-navigation"
import { ProviderBottomBar } from "@/components/provider/provider-bottom-bar"
import { RouteGuard } from "@/components/auth/route-guard"
import { useState, useEffect } from "react"
import { getUserFromToken } from "@/lib/client-auth-utils"
import { Loader2 } from "lucide-react"

interface ProviderLayoutProps {
  children: React.ReactNode
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener información del usuario del token
    const userData = getUserFromToken()
    if (userData) {
      setUser(userData)
    }
    setLoading(false)
  }, [])

  return (
    <RouteGuard requireAuth requireProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Barra de navegación superior */}
        <ProviderNavigation user={user} />

        {/* Contenido principal */}
        <main className="flex-1 container mx-auto px-4 pb-20 pt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="animate-fade-in">{children}</div>
          )}
        </main>

        {/* Barra de navegación inferior */}
        <ProviderBottomBar />
      </div>
    </RouteGuard>
  )
}
