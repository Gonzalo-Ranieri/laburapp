"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface PriceSetterProps {
  requestId: string
  currentPrice?: number | null
  onPriceSet?: (price: number) => void
}

export function PriceSetter({ requestId, currentPrice, onPriceSet }: PriceSetterProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [price, setPrice] = useState(currentPrice?.toString() || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const priceValue = Number.parseFloat(price)

      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Por favor ingresa un precio válido")
      }

      const response = await fetch("/api/requests/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          price: priceValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al establecer el precio")
      }

      if (onPriceSet) {
        onPriceSet(priceValue)
      }

      setShowDialog(false)
    } catch (err: any) {
      console.error("Error al establecer precio:", err)
      setError(err.message || "Error al establecer el precio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant={currentPrice ? "outline" : "default"} onClick={() => setShowDialog(true)} className="w-full">
        {currentPrice ? `Modificar precio: $${currentPrice.toFixed(2)}` : "Establecer precio"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Establecer precio del servicio</DialogTitle>
            <DialogDescription>Ingresa el precio que cobrarás por este servicio</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Precio (ARS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Guardando..." : "Guardar precio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
