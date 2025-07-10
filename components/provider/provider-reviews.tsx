"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, Flag, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface Review {
  id: string
  userId: string
  user_name: string
  user_image: string
  rating: number
  comment: string
  images: string[]
  createdAt: string
  service_description: string
  service_type: string
  helpful_count?: number
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

/**
 * Componente para mostrar las reseñas de un proveedor
 *
 * Muestra una lista de reseñas con información del cliente,
 * calificación y comentario
 */
export function ProviderReviews({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 5,
    offset: 0,
    pages: 0,
    currentPage: 1,
  })
  const [filter, setFilter] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [providerId, pagination.offset, filter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      let url = `/api/reviews?providerId=${providerId}&limit=${pagination.limit}&offset=${pagination.offset}`

      if (filter !== null) {
        url += `&rating=${filter}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error al cargar reseñas")
      }

      const data: ReviewsResponse = await response.json()
      setReviews(data.reviews)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
        currentPage: Math.floor(data.pagination.offset / data.pagination.limit) + 1,
      }))
      setError(null)
    } catch (err) {
      setError("No se pudieron cargar las reseñas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return

    setPagination((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
      currentPage: page,
    }))
  }

  const handleFilterChange = (rating: number | null) => {
    setFilter(rating)
    setPagination((prev) => ({
      ...prev,
      offset: 0,
      currentPage: 1,
    }))
  }

  const markHelpful = async (reviewId: string) => {
    try {
      // En una implementación real, esto sería una llamada a la API
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, helpful_count: (review.helpful_count || 0) + 1 } : review,
        ),
      )

      toast({
        title: "¡Gracias por tu feedback!",
        description: "Has marcado esta reseña como útil",
      })
    } catch (err) {
      console.error(err)
    }
  }

  const reportReview = (reviewId: string) => {
    toast({
      title: "Reseña reportada",
      description: "Gracias por ayudarnos a mantener la calidad de las reseñas",
    })
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchReviews} className="mt-2">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={filter === null ? "default" : "outline"} size="sm" onClick={() => handleFilterChange(null)}>
          Todas
        </Button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={filter === rating ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(rating)}
          >
            {rating} <Star className="h-3 w-3 ml-1 fill-current" />
          </Button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No hay reseñas disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={review.user_image || "/placeholder.svg"} alt={review.user_name} />
                    <AvatarFallback>{review.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{review.user_name}</h3>
                      <span className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 font-medium">{review.rating.toFixed(1)}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {review.service_type}
                      </Badge>
                    </div>

                    <p className="mt-2 text-gray-700">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img || "/placeholder.svg"}
                            alt={`Imagen de reseña ${idx + 1}`}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => markHelpful(review.id)}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{review.helpful_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>Responder</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => reportReview(review.id)}>
                        <Flag className="h-4 w-4 mr-1" />
                        <span>Reportar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Página {pagination.currentPage} de {pagination.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
