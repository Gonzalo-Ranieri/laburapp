"use client"

import { useRouter } from "next/navigation"

interface DynamicTagProps {
  tag: string
  className?: string
}

export function DynamicTag({ tag, className = "" }: DynamicTagProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/search?q=${encodeURIComponent(tag)}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors ${className}`}
    >
      {tag}
    </button>
  )
}
