"use client"

import { useState } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { ServicesList } from "./services-list"
import { SearchBar } from "./search-bar"

type Screen = "home" | "search" | "active" | "profile"

export function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [searchQuery, setSearchQuery] = useState("")

  // Función para manejar intentos de acceso a funciones que requieren autenticación
  const handleAuthRequired = () => {
    alert("Esta función requiere iniciar sesión. Por favor, inicia sesión para continuar.")
    // Aquí podrías redirigir a la página de login
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-emerald-600">LaburApp</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-16">
        {currentScreen === "home" && <ServicesList searchQuery={searchQuery} isDemo={true} />}
        {currentScreen === "search" && (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Solicitar un Servicio</h2>
            <p className="text-gray-500 mb-4">
              Esta función requiere iniciar sesión. Por favor, inicia sesión para continuar.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Iniciar sesión
            </button>
          </div>
        )}
        {currentScreen === "active" && (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Servicios Activos</h2>
            <p className="text-gray-500 mb-4">
              Esta función requiere iniciar sesión. Por favor, inicia sesión para continuar.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Iniciar sesión
            </button>
          </div>
        )}
        {currentScreen === "profile" && (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Perfil de Usuario</h2>
            <p className="text-gray-500 mb-4">
              Esta función requiere iniciar sesión. Por favor, inicia sesión para continuar.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </main>

      <BottomNavigation currentScreen={currentScreen} onChangeScreen={setCurrentScreen} />
    </div>
  )
}
