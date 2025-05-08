"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { categories } from "@/data/categories"

interface SearchBarProps {
  onSearch?: (query: string) => void
  className?: string
  placeholder?: string
  expanded?: boolean
}

export function SearchBar({
  onSearch,
  className = "",
  placeholder = "Buscar servicios...",
  expanded = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(expanded)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (query.length > 2) {
      // Generar sugerencias basadas en categorías y subcategorías
      const allServices: string[] = []

      categories.forEach((category) => {
        allServices.push(category.name)
        category.subcategories.forEach((subcategory) => {
          allServices.push(subcategory.name)
        })
      })

      const filtered = allServices.filter((service) => service.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [query])

  const handleSearch = () => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    if (onSearch) {
      onSearch(suggestion)
    } else {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    }
    setSuggestions([])
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setTimeout(() => {
        const inputElement = document.getElementById("search-input")
        if (inputElement) {
          inputElement.focus()
        }
      }, 100)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center transition-all duration-300 ${isExpanded ? "w-full" : "w-10"}`}>
        {isExpanded ? (
          <>
            <Input
              id="search-input"
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleExpand}>
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 border">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
