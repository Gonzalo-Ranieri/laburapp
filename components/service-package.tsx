"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ServiceItem {
  id: string
  name: string
  description: string
}

interface ServicePackageProps {
  id: string
  title: string
  description: string
  price: number
  discountPercentage?: number
  services: ServiceItem[]
  popularTag?: boolean
  onSelect: (packageId: string) => void
}

export function ServicePackage({
  id,
  title,
  description,
  price,
  discountPercentage,
  services,
  popularTag = false,
  onSelect,
}: ServicePackageProps) {
  const originalPrice = discountPercentage ? price / (1 - discountPercentage / 100) : undefined

  return (
    <Card className={`${popularTag ? "border-emerald-500 shadow-md" : ""} relative`}>
      {popularTag && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-emerald-500">Más popular</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="flex items-end">
            <span className="text-3xl font-bold">${price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${originalPrice.toLocaleString()}</span>
            )}
          </div>
          {discountPercentage && (
            <Badge variant="outline" className="bg-green-50 text-green-700 mt-1">
              Ahorro del {discountPercentage}%
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {services.map((service) => (
            <div key={service.id} className="flex">
              <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{service.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 ml-1 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">{service.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant={popularTag ? "default" : "outline"} onClick={() => onSelect(id)}>
          Seleccionar paquete
        </Button>
      </CardFooter>
    </Card>
  )
}
