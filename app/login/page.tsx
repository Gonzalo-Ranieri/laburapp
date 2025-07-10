import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
          <LoginForm />

          <div className="mt-8 p-4 bg-yellow-100 rounded">
            <h2 className="text-lg font-bold mb-2">¿Problemas con la redirección?</h2>
            <p className="mb-4">
              Si después de iniciar sesión no eres redirigido automáticamente, puedes usar estos enlaces:
            </p>
            <div className="flex flex-col space-y-2">
              <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600">
                Ir a la página principal
              </a>
              <a
                href="/provider-dashboard"
                className="bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600"
              >
                Ir al Dashboard de Proveedor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
