"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface ServiceModalProps {
  provider: any
  onClose: () => void
}

export function ServiceModal({ provider, onClose }: ServiceModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(3)
    }, 1500)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Solicitar Servicio"}
            {step === 2 && "Confirmar Solicitud"}
            {step === 3 && "¡Solicitud Enviada!"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.image || "/placeholder.svg"} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-gray-500">{provider.service}</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm ml-1">{provider.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({provider.reviews} reseñas)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha del servicio</label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="border rounded-md"
                  disabled={(date) => date < new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción del problema</label>
                <Textarea
                  placeholder="Describa el problema o servicio que necesita..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)} disabled={!date || !description}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Resumen de la solicitud</h3>
                <p className="text-sm mb-1">
                  <span className="font-medium">Servicio:</span> {provider.service}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Profesional:</span> {provider.name}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Fecha:</span> {date?.toLocaleDateString()}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Descripción:</span> {description}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Precio estimado:</span> {provider.price}
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Método de pago</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-6 bg-gray-200 rounded mr-2"></div>
                    <span className="text-sm">•••• 4242</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Cambiar
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Confirmar Solicitud"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">¡Solicitud enviada con éxito!</h3>
              <p className="text-sm text-gray-500 mb-4">
                {provider.name} recibirá tu solicitud y te contactará pronto para confirmar los detalles.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={onClose}>Cerrar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
