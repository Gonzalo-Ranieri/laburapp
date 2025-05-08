import { FilterSidebar } from "@/components/filter-sidebar"
import { ProvidersMapView } from "@/components/providers-map-view"
import { categories } from "@/data/categories"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface SubcategoryPageProps {
  params: {
    categoryId: string
    subcategoryId: string
  }
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { categoryId, subcategoryId } = params
  const category = categories.find((c) => c.id === categoryId)
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId)

  if (!category || !subcategory) {
    return <div className="container mx-auto px-4 py-8">Subcategoría no encontrada</div>
  }

  // Datos de ejemplo para proveedores
  const mockProviders = [
    {
      id: "prov1",
      name: "Martín Gutiérrez",
      serviceType: subcategory.name,
      latitude: -34.5982,
      longitude: -58.4376,
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.8,
      reviewCount: 127,
      distance: 2.3,
      tags: ["highly-rated", "fast-responder"],
      badges: ["identity-verified", "certified-professional"],
    },
    {
      id: "prov2",
      name: "Laura Sánchez",
      serviceType: subcategory.name,
      latitude: -34.5784,
      longitude: -58.4233,
      image: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 4.9,
      reviewCount: 84,
      distance: 1.5,
      tags: ["top-rated", "verified-pro"],
      badges: ["identity-verified", "background-checked", "top-provider"],
    },
    {
      id: "prov3",
      name: "Carlos Rodríguez",
      serviceType: subcategory.name,
      latitude: -34.6037,
      longitude: -58.3816,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.7,
      reviewCount: 56,
      distance: 3.1,
      tags: ["high-completion"],
      badges: ["identity-verified", "experienced"],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/">Inicio</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/categories/${categoryId}`}>{category.name}</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900">{subcategory.name}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{subcategory.name}</h1>
        <p className="text-gray-600">{subcategory.description}</p>

        {subcategory.requiresCertification && (
          <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
            Este servicio requiere profesionales certificados en: {subcategory.certificationTypes?.join(", ")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterSidebar onFilterChange={(filters) => console.log("Filtros aplicados:", filters)} isMobile={true} />
        </div>
        <div className="lg:col-span-3">
          <ProvidersMapView providers={mockProviders} />
        </div>
      </div>
    </div>
  )
}
