"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Star, MapPin, MessageSquare, Phone, Trash2 } from "lucide-react"

export default function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState([
    {
      id: "1",
      name: "Carlos Rodríguez",
      service: "Electricista",
      rating: 4.8,
      reviewCount: 127,
      location: "Villa Crespo, CABA",
      image: "/placeholder.svg?height=80&width=80",
      badges: ["Verificado", "Respuesta rápida"],
      price: "Desde $2,500",
      addedDate: "2023-05-15",
    },
    {
      id: "2",
      name: "María González",
      service: "Plomera",
      rating: 4.9,
      reviewCount: 84,
      location: "Palermo, CABA",
      image: "/placeholder.svg?height=80&width=80",
      badges: ["Verificado", "Top profesional"],
      price: "Desde $3,000",
      addedDate: "2023-05-10",
    },
    {
      id: "3",
      name: "Ana Martínez",
      service: "Limpieza",
      rating: 4.7,
      reviewCount: 156,
      location: "Belgrano, CABA",
      image: "/placeholder.svg?height=80&width=80",
      badges: ["Verificado", "Eco-friendly"],
      price: "Desde $1,800",
      addedDate: "2023-05-08",
    },
    {
      id: "4",
      name: "Roberto Sánchez",
      service: "Carpintero",
      rating: 4.6,
      reviewCount: 93,
      location: "San Telmo, CABA",
      image: "/placeholder.svg?height=80&width=80",
      badges: ["Verificado", "Especialista"],
      price: "Desde $4,000",
      addedDate: "2023-05-05",
    },
  ])

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  const filteredFavorites = favorites.filter(
    (favorite) =>
      favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.service.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground">Profesionales que has guardado para contactar más tarde</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar en favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de favoritos */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "No se encontraron favoritos" : "No tienes favoritos guardados"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Cuando encuentres profesionales que te gusten, guárdalos aquí para contactarlos fácilmente"}
              </p>
              {!searchTerm && (
                <Button onClick={() => (window.location.href = "/search")}>Explorar profesionales</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {filteredFavorites.length} profesional{filteredFavorites.length !== 1 ? "es" : ""} guardado
              {filteredFavorites.length !== 1 ? "s" : ""}
            </p>

            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={favorite.image || "/placeholder.svg"} alt={favorite.name} />
                      <AvatarFallback>{favorite.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{favorite.name}</h3>
                          <p className="text-muted-foreground">{favorite.service}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavorite(favorite.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{favorite.rating}</span>
                          <span className="text-muted-foreground">({favorite.reviewCount} reseñas)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{favorite.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {favorite.badges.map((badge, index) => (
                          <Badge key={index} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="font-medium text-emerald-600">{favorite.price}</p>
                          <p className="text-xs text-muted-foreground">
                            Guardado el {new Date(favorite.addedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Mensaje
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Llamar
                          </Button>
                          <Button size="sm">Ver perfil</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sugerencias */}
        {filteredFavorites.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">💡 Consejo</h3>
              <p className="text-muted-foreground text-sm">
                Contacta a tus profesionales favoritos con anticipación para asegurar su disponibilidad. Los mejores
                profesionales suelen tener agenda ocupada.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
