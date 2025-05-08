export default function SimpleDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Simple</h1>
      <p className="mb-4">Esta es una página de dashboard de prueba sin autenticación.</p>

      <div className="bg-green-100 p-4 rounded">
        <p>Si puedes ver esta página, el enrutamiento básico está funcionando correctamente.</p>
      </div>

      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">
          Volver a la página de inicio
        </a>
      </div>
    </div>
  )
}
