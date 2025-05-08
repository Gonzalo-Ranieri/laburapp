export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Página no encontrada</h1>
      <p className="mb-4">La página que estás buscando no existe.</p>

      <div className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">
          Volver a la página de inicio
        </a>
      </div>
    </div>
  )
}
