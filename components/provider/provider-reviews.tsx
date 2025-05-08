"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

/**
 * Componente para mostrar las reseñas de un proveedor
 *
 * Muestra una lista de reseñas con información del cliente,
 * calificación y comentario
 */
export function ProviderReviews({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState([
    {
      id: "rev1",
      userName: "Laura Méndez",
      userImage: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2023-04-28",
      comment: "Excelente trabajo, muy profesional y puntual. Resolvió todos los problemas que teníamos.",
    },
    {
      id: "rev2",
      userName: "Carlos Fernández",
      userImage: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "2023-04-15",
      comment: "Buen trabajo, solucionó el problema rápidamente.",
    },
    {
      id: "rev3",
      userName: "María Rodríguez",
      userImage: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2023-04-02",
      comment: "Muy conforme con el trabajo. Quedó todo perfecto y el precio fue justo.",
    },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [providerId])

  if (loading) {
    return <div className="flex justify-center py-8">Cargando reseñas...</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={review.userImage || "/placeholder.svg"} alt={review.userName} />
                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{review.userName}</h3>
                  <span className="text-gray-500 text-sm ml-2">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
