"use client"

import { useState } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { ServicesList } from "./services-list"
import { SearchBar } from "./search-bar"
import { UserProfile } from "./user-profile"
import { RequestService } from "./request-service"
import { ActiveServices } from "./active-services"

type Screen = "home" | "search" | "active" | "profile"

export function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-emerald-600">LaburApp</h1>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-16">
        {currentScreen === "home" && <ServicesList searchQuery={searchQuery} />}
        {currentScreen === "search" && <RequestService />}
        {currentScreen === "active" && <ActiveServices />}
        {currentScreen === "profile" && <UserProfile />}
      </main>

      <BottomNavigation currentScreen={currentScreen} onChangeScreen={setCurrentScreen} />
    </div>
  )
}
