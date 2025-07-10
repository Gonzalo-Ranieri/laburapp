"use client"

import * as React from "react"

type Theme = "light" | "dark"
interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    return (localStorage.getItem("laburapp-theme") as Theme) ?? "light"
  })

  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      if (typeof window !== "undefined") {
        localStorage.setItem("laburapp-theme", next)
        document.documentElement.classList.toggle("dark", next === "dark")
      }
      return next
    })

  /* keep <html> in sync on first paint (client) */
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

/* optional convenience hook */
export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
