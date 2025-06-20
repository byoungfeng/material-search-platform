"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Play, Download, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FavoriteItem {
  id: number
  type: "video" | "photo" | "music"
  title: string
  thumbnail: string
  duration?: string
  addedAt: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn")
    if (loginStatus !== "true") {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)

    // 模拟收藏数据
    const mockFavorites: FavoriteItem[] = [
      {
        id: 1,
        type: "video",
        title: "Business Meeting Professional Discussion",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "1:30",
        addedAt: "2024-01-15",
      },
      {
        id: 2,
        type: "photo",
        title: "Mountain Landscape Sunset View",
        thumbnail: "/placeholder.svg?height=200&width=300",
        addedAt: "2024-01-14",
      },
      {
        id: 3,
        type: "music",
        title: "Upbeat Corporate Background Music",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "2:45",
        addedAt: "2024-01-13",
      },
    ]

    setFavorites(mockFavorites)
  }, [router])

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter((item) => item.id !== id))
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">素材搜索</span>
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-900">我的收藏</h1>
            </div>

            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">还没有收藏任何素材</h2>
            <p className="text-gray-500 mb-6">去搜索一些喜欢的素材并收藏吧！</p>
            <Link href="/">
              <Button>开始搜索</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">我的收藏 ({favorites.length})</h2>
              <div className="text-sm text-gray-500">按添加时间排序</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* 媒体类型指示器 */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.type === "video"
                            ? "bg-red-500 text-white"
                            : item.type === "photo"
                              ? "bg-green-500 text-white"
                              : "bg-purple-500 text-white"
                        }`}
                      >
                        {item.type === "video" ? "视频" : item.type === "photo" ? "图片" : "音乐"}
                      </span>
                    </div>

                    {/* 播放按钮 */}
                    {(item.type === "video" || item.type === "music") && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    {/* 时长 */}
                    {item.duration && (
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          {item.duration}
                        </span>
                      </div>
                    )}

                    {/* 移除收藏按钮 */}
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{item.title}</h3>

                    <div className="text-xs text-gray-500 mb-3">
                      收藏于 {new Date(item.addedAt).toLocaleDateString("zh-CN")}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        下载
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(item.id)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
