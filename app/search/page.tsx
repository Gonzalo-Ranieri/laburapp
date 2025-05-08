import { FilterSidebar } from "@/components/filter-sidebar"
import { ProviderCard } from "@/components/provider-card"
import { DynamicTag } from "@/components/dynamic-tag"
import { SearchContainer } from "@/components/search/search-container"

/**
 * Página de búsqueda de servicios
 *
 * Esta página permite a los usuarios buscar servicios y proveedores,
 * aplicar filtros y ver los resultados en forma de tarjetas.
 */
export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Buscar Servicios</h1>
        <SearchContainer />
      </section>

      {/* Etiquetas dinámicas para búsquedas rápidas */}
      <section className="flex flex-wrap gap-2">
        <DynamicTag tag="Plomería" />
        <DynamicTag tag="Electricidad" />
        <DynamicTag tag="Limpieza" />
        <DynamicTag tag="Carpintería" />
        <DynamicTag tag="Pintura" />
      </section>

      {/* Contenedor principal con filtros y resultados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra lateral de filtros */}
        <div className="md:col-span-1">
          <FilterSidebar />
        </div>

        {/* Resultados de búsqueda */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-medium">Resultados</h2>

          {/* Lista de proveedores */}
          <div className="space-y-4">
            {/* Estos serían los resultados reales de la búsqueda */}
            <ProviderCard
              provider={{
                id: "1",
                name: "Juan Pérez",
                service: "Plomería",
                rating: 4.8,
                reviews: 24,
                price: "$50/hora",
                distance: 2.3, // Cambiado a número
                distanceUnit: "km", // Añadida unidad separada
                image: "/placeholder.svg?height=80&width=80",
              }}
            />
            <ProviderCard
              provider={{
                id: "2",
                name: "María González",
                service: "Electricidad",
                rating: 4.5,
                reviews: 18,
                price: "$45/hora",
                distance: 3.1, // Cambiado a número
                distanceUnit: "km", // Añadida unidad separada
                image: "/placeholder.svg?height=80&width=80",
              }}
            />
            <ProviderCard
              provider={{
                id: "3",
                name: "Carlos Rodríguez",
                service: "Carpintería",
                rating: 4.9,
                reviews: 32,
                price: "$55/hora",
                distance: 1.8, // Cambiado a número
                distanceUnit: "km", // Añadida unidad separada
                image: "/placeholder.svg?height=80&width=80",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
