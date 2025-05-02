"use client"

import { Home, Search, Clock, User } from "lucide-react"

type Screen = "home" | "search" | "active" | "profile"

interface BottomNavigationProps {
  currentScreen: Screen
  onChangeScreen: (screen: Screen) => void
}

export function BottomNavigation({ currentScreen, onChangeScreen }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex justify-around">
        <button
          onClick={() => onChangeScreen("home")}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            currentScreen === "home" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Inicio</span>
        </button>
        <button
          onClick={() => onChangeScreen("search")}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            currentScreen === "search" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">Buscar</span>
        </button>
        <button
          onClick={() => onChangeScreen("active")}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            currentScreen === "active" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <Clock size={24} />
          <span className="text-xs mt-1">Activos</span>
        </button>
        <button
          onClick={() => onChangeScreen("profile")}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            currentScreen === "profile" ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </nav>
  )
}
