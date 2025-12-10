import { Suspense } from "react"
import ProviderServices from "@/components/provider/provider-services"
import { Card, CardContent } from "@/components/ui/card"

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
                  </div>
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="flex justify-between">
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="flex justify-between pt-2">
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ProviderServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <ProviderServices />
      </Suspense>
    </div>
  )
}
