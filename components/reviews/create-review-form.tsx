"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Upload, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CreateReviewFormProps {
  requestId: string
  providerName: string
  providerImage?: string
  serviceType: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateReviewForm({
  requestId,
  providerName,
  providerImage,
  serviceType,
  onSuccess,
  onCancel,
}: CreateReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una calificación",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          rating,
          comment,
          images,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al enviar la reseña")
      }

      toast({
        title: "¡Reseña enviada!",
        description: "Gracias por compartir tu experiencia",
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/active")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar la reseña",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setImageUploading(true)

      // En una implementación real, esto subiría la imagen a un servicio como Vercel Blob
      // Aquí simulamos la subida con un timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulamos URLs de imágenes
      const newImages = Array.from(files).map(
        (_, index) => `/placeholder.svg?height=200&width=200&text=Imagen+${images.length + index + 1}`,
      )

      setImages([...images, ...newImages])
      toast({
        title: "Imágenes subidas",
        description: `${files.length} ${files.length === 1 ? "imagen subida" : "imágenes subidas"} correctamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
      // Limpiar el input
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Califica tu experiencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={providerImage || "/placeholder.svg"} alt={providerName} />
            <AvatarFallback>{providerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{providerName}</h3>
            <p className="text-sm text-gray-500">{serviceType}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Calificación</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= value ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium">
            Comentario
          </label>
          <Textarea
            id="comment"
            placeholder="Comparte tu experiencia con este servicio..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Imágenes (opcional)</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img || "/placeholder.svg"}
                  alt={`Imagen ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <label className="h-20 w-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              {imageUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageUploading || images.length >= 5}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">Puedes subir hasta 5 imágenes</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar reseña"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
