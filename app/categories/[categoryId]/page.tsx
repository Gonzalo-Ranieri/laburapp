import { SubcategoryList } from "@/components/subcategory-list"
import { categories } from "@/data/categories"

interface CategoryPageProps {
  params: {
    categoryId: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = params
  const category = categories.find((c) => c.id === categoryId)

  if (!category) {
    return <div className="container mx-auto px-4 py-8">Categoría no encontrada</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SubcategoryList categoryId={categoryId} />
    </div>
  )
}
