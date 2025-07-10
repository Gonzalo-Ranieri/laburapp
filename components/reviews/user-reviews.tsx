"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Star, Edit2, Trash2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Review {
  id: string
  providerId: string
  user_name: string
  rating: number
  comment: string
  createdAt: string
  service_description: string
  service_type: string
}

export function UserReviews({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("given")
  const [reviews, setReviews] = useState<Review[]>([])
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (activeTab === "given") {
      fetchGivenReviews()
    } else {
      fetchReceivedReviews()
    }
  }, [activeTab, userId])

  const fetchGivenReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Error al cargar reseñas")
      }

      const data = await response.json()
      setReviews(data.reviews)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudieron cargar tus reseñas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReceivedReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?providerId=${userId}`)

      if (!response.ok) {
        throw new Error("Error al cargar reseñas recibidas")
      }

      const data = await response.json()
      setReceivedReviews(data.reviews)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reseñas recibidas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    try {
      const response = await fetch(`/api/reviews/${reviewToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la reseña")
      }

      setReviews(reviews.filter((review) => review.id !== reviewToDelete))
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada correctamente",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña",
        variant: "destructive",
      })
    } finally {
      setReviewToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setDeleteDialogOpen(true)
  }

  const renderReviewsList = (reviewsList: Review[], canEdit = false) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (reviewsList.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-muted-foreground">
              {activeTab === "given" ? "Aún no has dejado ninguna reseña" : "Aún no has recibido ninguna reseña"}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {reviewsList.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{activeTab === "given" ? review.service_type : review.user_name}</h3>
                  <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                  <p className="mt-1 text-sm text-gray-500">{review.service_description}</p>
                </div>

                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(review.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Reseñas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="given">Reseñas dadas</TabsTrigger>
              <TabsTrigger value="received">Reseñas recibidas</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="given">{renderReviewsList(reviews, true)}</TabsContent>
              <TabsContent value="received">{renderReviewsList(receivedReviews)}</TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
