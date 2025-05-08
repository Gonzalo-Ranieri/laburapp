"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle, Mail, Lock, User, Briefcase } from "lucide-react"
import { saveToken } from "@/lib/client-auth-utils"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setSuccess(false)

    try {
      // Validación básica
      if (!email || !password) {
        setError("Por favor ingresa tu email y contraseña")
        setIsLoading(false)
        return
      }

      console.log("Iniciando sesión con:", email)

      // Llamar a la API de login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      console.log("Login exitoso:", data)

      // Guardar el token en localStorage
      if (data.token) {
        saveToken(data.token)
        console.log("Token guardado en localStorage")
      }

      setSuccess(true)

      // Determinar a dónde redirigir
      const redirectUrl = data.user && data.user.isProvider ? "/provider-dashboard" : "/"
      console.log("Redirigiendo a:", redirectUrl)

      // Usar window.location para la redirección en lugar de router.push
      // Esto fuerza una recarga completa de la página
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 1000)
    } catch (err) {
      console.error("Error en login:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
      setSuccess(false)
    } finally {
      if (!success) {
        setIsLoading(false)
      }
    }
  }

  // Función para llenar rápidamente el formulario (solo para demostración)
  const fillDemoCredentials = (type: "user" | "provider") => {
    if (type === "user") {
      setEmail("usuario@test.com")
      setPassword("Password123!")
    } else {
      setEmail("proveedor@test.com")
      setPassword("Password123!")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Panel izquierdo - Solo visible en pantallas medianas y grandes */}
        <div className="hidden sm:flex sm:w-1/2 bg-primary/10 p-8 flex-col justify-between">
          <div>
            <Logo size="lg" className="mb-8" />
            <h1 className="text-3xl font-bold mb-4">Bienvenido de nuevo</h1>
            <p className="text-muted-foreground mb-8">Inicia sesión para acceder a todos los servicios de LaburApp.</p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
            <h3 className="font-medium mb-4">Lo que nuestros usuarios dicen:</h3>
            <blockquote className="text-muted-foreground italic mb-4">
              "LaburApp me ha permitido encontrar profesionales confiables para mis necesidades de hogar. ¡Altamente
              recomendado!"
            </blockquote>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div>
                <p className="font-medium text-sm">María González</p>
                <p className="text-xs text-muted-foreground">Cliente desde 2023</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <div className="w-full sm:w-1/2 p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Logo solo visible en móviles */}
            <div className="sm:hidden flex justify-center mb-8">
              <Logo size="lg" />
            </div>

            <Card className="border-none shadow-lg animate-fade-in">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4 animate-slide-in-up">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-green-50 border-green-200 animate-slide-in-up">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">¡Inicio de sesión exitoso!</AlertTitle>
                    <AlertDescription className="text-green-700">Redirigiendo...</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 focus-ring"
                        required
                        disabled={isLoading || success}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                      </Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 focus-ring"
                        required
                        disabled={isLoading || success}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full focus-ring" disabled={isLoading || success}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Sesión iniciada
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Acceso rápido para demostración</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="focus-ring"
                    onClick={() => fillDemoCredentials("user")}
                    type="button"
                    disabled={isLoading || success}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Usuario
                  </Button>
                  <Button
                    variant="outline"
                    className="focus-ring"
                    onClick={() => fillDemoCredentials("provider")}
                    type="button"
                    disabled={isLoading || success}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Proveedor
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                <div className="text-center text-sm">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Regístrate
                  </Link>
                </div>

                {/* Enlaces de redirección manual */}
                <div className="text-xs text-center text-muted-foreground">
                  ¿Problemas con la redirección?{" "}
                  <Link href="/" className="text-primary hover:underline">
                    Ir a inicio
                  </Link>{" "}
                  o{" "}
                  <Link href="/provider-dashboard" className="text-primary hover:underline">
                    Ir al dashboard
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
