import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Blog | LaburApp",
  description: "Artículos, consejos y novedades sobre servicios profesionales y LaburApp.",
}

export default function BlogPage() {
  const featuredPost = {
    id: "1",
    title: "Cómo elegir al mejor profesional para tu hogar",
    excerpt: "Descubre los factores clave que debes considerar al contratar servicios profesionales para tu hogar.",
    date: "10 de junio, 2023",
    author: "Ana Rodríguez",
    authorRole: "Especialista en Servicios",
    authorImage: "/placeholder.svg?height=100&width=100",
    image: "/placeholder.svg?height=600&width=1200",
    category: "Consejos",
    readTime: "5 min",
  }

  const posts = [
    {
      id: "2",
      title: "Los 5 errores más comunes al contratar un plomero",
      excerpt:
        "Evita estos errores frecuentes que pueden costarte tiempo y dinero cuando necesitas servicios de plomería.",
      date: "5 de junio, 2023",
      author: "Carlos Méndez",
      image: "/placeholder.svg?height=400&width=600",
      category: "Consejos",
      readTime: "4 min",
    },
    {
      id: "3",
      title: "Cómo preparar tu casa para una remodelación",
      excerpt: "Guía paso a paso para preparar tu hogar antes de comenzar un proyecto de remodelación.",
      date: "1 de junio, 2023",
      author: "Lucía Fernández",
      image: "/placeholder.svg?height=400&width=600",
      category: "Guías",
      readTime: "6 min",
    },
    {
      id: "4",
      title: "Tendencias en diseño de interiores para 2023",
      excerpt: "Descubre las tendencias más populares en diseño de interiores que dominarán este año.",
      date: "28 de mayo, 2023",
      author: "Martín López",
      image: "/placeholder.svg?height=400&width=600",
      category: "Tendencias",
      readTime: "3 min",
    },
    {
      id: "5",
      title: "Cómo convertirte en un proveedor exitoso en LaburApp",
      excerpt: "Consejos prácticos para destacar tu perfil y conseguir más clientes en nuestra plataforma.",
      date: "25 de mayo, 2023",
      author: "Ana Rodríguez",
      image: "/placeholder.svg?height=400&width=600",
      category: "Para Proveedores",
      readTime: "7 min",
    },
    {
      id: "6",
      title: "Mantenimiento preventivo: ahorra dinero a largo plazo",
      excerpt: "Aprende cómo el mantenimiento regular puede evitar costosas reparaciones en el futuro.",
      date: "20 de mayo, 2023",
      author: "Carlos Méndez",
      image: "/placeholder.svg?height=400&width=600",
      category: "Consejos",
      readTime: "5 min",
    },
    {
      id: "7",
      title: "Servicios más solicitados durante la pandemia",
      excerpt: "Análisis de los servicios profesionales que experimentaron mayor demanda durante la crisis sanitaria.",
      date: "15 de mayo, 2023",
      author: "Lucía Fernández",
      image: "/placeholder.svg?height=400&width=600",
      category: "Análisis",
      readTime: "4 min",
    },
  ]

  const categories = ["Todos", "Consejos", "Guías", "Tendencias", "Para Proveedores", "Análisis", "Noticias"]

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Blog de LaburApp</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Artículos, consejos y novedades sobre servicios profesionales y LaburApp.
        </p>
      </section>

      {/* Categorías */}
      <section className="flex flex-wrap gap-2 justify-center">
        {categories.map((category, index) => (
          <Button key={index} variant={index === 0 ? "default" : "outline"} size="sm">
            {category}
          </Button>
        ))}
      </section>

      {/* Artículo destacado */}
      <section>
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-64 md:h-auto">
              <Image
                src={featuredPost.image || "/placeholder.svg"}
                alt={featuredPost.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Destacado
              </div>
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                  {featuredPost.category}
                </span>
                <span className="text-muted-foreground text-sm">{featuredPost.readTime} de lectura</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{featuredPost.title}</h2>
              <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={featuredPost.authorImage || "/placeholder.svg"}
                    alt={featuredPost.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{featuredPost.author}</p>
                  <p className="text-sm text-muted-foreground">{featuredPost.date}</p>
                </div>
              </div>
              <Link href={`/blog/${featuredPost.id}`}>
                <Button>Leer artículo</Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Lista de artículos */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Artículos recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  {post.category}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/blog/${post.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Leer más
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-emerald-50 p-8 rounded-xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Suscríbete a nuestro newsletter</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Recibe los últimos artículos, consejos y novedades de LaburApp directamente en tu correo.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button>Suscribirse</Button>
        </div>
      </section>
    </div>
  )
}
