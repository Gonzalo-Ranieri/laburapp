import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, CreditCard, LogOut, Star, PenToolIcon as Tool } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PaymentDashboard } from "./payment-dashboard"
import { logout } from "@/actions/auth-actions"

export function UserProfile() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Usuario" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">Usuario Demo</h2>
          <p className="text-sm text-gray-500">usuario@ejemplo.com</p>
        </div>
      </div>

      <Tabs defaultValue="cliente">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="profesional">Profesional</TabsTrigger>
        </TabsList>

        <TabsContent value="cliente" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Métodos de pago</h3>
                </div>
                <Button variant="ghost" size="sm">
                  Gestionar
                </Button>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Mis reseñas</h3>
                </div>
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Configuración</h3>
                </div>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Preferencias</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones push</p>
                  <p className="text-sm text-gray-500">Recibir alertas de servicios</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Correos electrónicos</p>
                  <p className="text-sm text-gray-500">Recibir ofertas y novedades</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Panel de pagos para clientes */}
          <PaymentDashboard userId="user123" isProvider={false} />

          <form action={logout}>
            <Button variant="outline" className="w-full flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="profesional" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tool className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">¡Conviértete en profesional!</h3>
                <p className="text-sm text-gray-500 mb-4">Ofrece tus servicios y genera ingresos adicionales</p>
                <Button>Registrarse como profesional</Button>
              </div>
            </CardContent>
          </Card>

          {/* Panel de ingresos para profesionales (visible solo si es profesional) */}
          <PaymentDashboard userId="user123" isProvider={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
