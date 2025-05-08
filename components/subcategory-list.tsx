"use client"
import Link from "next/link"
import { categories } from "@/data/categories"
import { Badge } from "@/components/ui/badge"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SubcategoryListProps {
  categoryId: string
}

export function SubcategoryList({ categoryId }: SubcategoryListProps) {
  const category = categories.find((c) => c.id === categoryId)

  if (!category) {
    return <div>Categoría no encontrada</div>
  }

  const IconComponent =
    (Icons as Record<string, LucideIcon>)[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] ||
    Icons.HelpCircle

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-full">
          <IconComponent className="h-5 w-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold">{category.name}</h2>
      </div>

      <p className="text-gray-600">{category.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {category.subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/categories/${category.id}/${subcategory.id}`}
            className="flex items-center justify-between p-3 border rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">{subcategory.name}</span>
              {subcategory.requiresCertification && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Requiere certificación
                </Badge>
              )}
            </div>
            <Icons.ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
