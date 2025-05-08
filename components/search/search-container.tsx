"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search/search-bar"

export function SearchContainer() {
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = (query: string) => {
    console.log("Búsqueda:", query)
    // Aquí iría la lógica para buscar y actualizar searchResults
  }

  return <SearchBar onSearch={handleSearch} />
}
