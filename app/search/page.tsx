import { Suspense } from "react"
import SearchResults from "@/components/search-results"
import SearchHeader from "@/components/search-header"

interface SearchPageProps {
  searchParams: {
    q?: string
    type?: string
    page?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const type = searchParams.type || "all"
  const page = Number.parseInt(searchParams.page || "1")

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader initialQuery={query} initialType={type} />

      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} type={type} page={page} />
        </Suspense>
      </main>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="w-full h-48 bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
