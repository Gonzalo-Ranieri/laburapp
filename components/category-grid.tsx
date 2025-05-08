"use client"
import Link from "next/link"
import { categories } from "@/data/categories"
import type { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => {
        // Obtener el icono dinámicamente
        const IconComponent =
          (Icons as Record<string, LucideIcon>)[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] ||
          Icons.HelpCircle

        return (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="flex flex-col items-center p-4 border rounded-lg hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-full mb-3">
              <IconComponent className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-center">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
