import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories } from "@/data/categories"
import { CategoryGrid } from "@/components/category-grid"

export const metadata: Metadata = {
  title: "Todos los servicios | LaburApp",
  description: "Explora todos los servicios disponibles en LaburApp, organizados por categorías.",
}

export default function ServicesPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Todos los servicios</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra amplia gama de servicios disponibles, organizados por categorías para facilitar tu búsqueda.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="new">Nuevos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
                <CategoryGrid category={category} showDescription={true} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="popular" className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Servicios más solicitados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .flatMap((category) => category.subcategories)
                  .slice(0, 6)
                  .map((subcategory) => (
                    <Card key={subcategory.id} className="overflow-hidden">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {subcategory.icon && <subcategory.icon className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{subcategory.name}</h3>
                          <p className="text-sm text-muted-foreground">+500 proveedores</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Servicios recién añadidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .flatMap((category) => category.subcategories)
                  .slice(6, 12)
                  .map((subcategory) => (
                    <Card key={subcategory.id} className="overflow-hidden">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                          {subcategory.icon && <subcategory.icon className="h-5 w-5 text-emerald-600" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{subcategory.name}</h3>
                          <p className="text-sm text-muted-foreground">Nuevo</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
