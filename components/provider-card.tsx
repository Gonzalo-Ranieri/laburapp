import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface Provider {
  id: string
  name: string
  service: string
  rating: number
  reviews: number
  price: string
  distance: number
  distanceUnit?: string
  image: string
  availability?: string
}

interface ProviderCardProps {
  provider: Provider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  // Formatear la distancia con 1 decimal y añadir la unidad
  const formattedDistance = `${provider.distance.toFixed(1)} ${provider.distanceUnit || "km"}`

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border border-gray-200">
              <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
              <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.service}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm ml-1">{provider.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({provider.reviews} reseñas)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {formattedDistance}
            </div>
            {provider.availability && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {provider.availability}
              </div>
            )}
            <div className="text-sm font-medium">{provider.price}</div>
          </div>

          <Link href={`/providers/${provider.id}`} passHref>
            <Button className="w-full mt-4">Ver Perfil</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
