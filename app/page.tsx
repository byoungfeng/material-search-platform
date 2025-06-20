import { Suspense } from "react"
import SearchInterface from "@/components/search-interface"
import PopularContent from "@/components/popular-content"
import ConfigBanner from "@/components/config-banner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ConfigBanner />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">素材搜索平台</h1>
          <p className="text-lg text-gray-600 mb-8">搜索高质量的免费视频、图片和音乐素材</p>

          <SearchInterface />
        </div>

        <Suspense fallback={<div className="text-center">加载中...</div>}>
          <PopularContent />
        </Suspense>
      </main>
    </div>
  )
}
