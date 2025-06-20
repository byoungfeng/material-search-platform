"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Download, Heart, Clock, Eye, ExternalLink, User, ImageIcon } from "lucide-react"
import { useState } from "react"
import ApiStatus from "@/components/api-status"

interface SearchResultsProps {
  query: string
  type: string
  page: number
}

interface SearchResult {
  id: number
  type: "photo" | "video"
  title: string
  thumbnail: string
  previewURL?: string
  largeImageURL?: string
  videoURL?: string
  duration?: number
  pageURL: string
  tags: string
  views: number
  downloads: number
  likes: number
  user: string
  userImageURL?: string
  source: string
}

interface ApiResponse {
  query: string
  translatedQuery: string
  type: string
  page: number
  totalHits: number
  hits: SearchResult[]
  rateLimit?: {
    remaining: string | null
    reset: string | null
  }
  error?: string
  usingMockData?: boolean
}

// 图片加载组件
function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackSrc,
  ...props
}: {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: "lazy" | "eager"
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center absolute inset-0`}>
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <img
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  )
}

async function fetchSearchResults(query: string, type: string, page: number): Promise<ApiResponse> {
  const params = new URLSearchParams({
    q: query,
    type: type,
    page: page.toString(),
  })

  const response = await fetch(`/api/search?${params}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Network error" }))
    throw new Error(errorData.error || "Search failed")
  }

  return response.json()
}

export default async function SearchResults({ query, type, page }: SearchResultsProps) {
  try {
    const data = await fetchSearchResults(query, type, page)

    if (data.error) {
      return (
        <div className="text-center py-16">
          <div className="text-red-500 text-lg mb-4">搜索出错</div>
          <p className="text-gray-600 mb-4">{data.error}</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      )
    }

    const showConfigPrompt = data.usingMockData
    const results = data.hits
    const totalResults = data.totalHits

    if (results.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-4">未找到相关素材</div>
          <p className="text-gray-400 mb-4">尝试使用其他关键词，如"自然风景"、"商业会议"等</p>
        </div>
      )
    }

    return (
      <div>
        {/* API状态显示 */}
        <ApiStatus usingMockData={showConfigPrompt} rateLimit={data.rateLimit} />

        {/* 搜索结果统计 */}
        <div className="mb-6">
          <p className="text-gray-600">
            找到 <span className="font-semibold">{totalResults.toLocaleString()}</span> 个关于 "
            <span className="font-semibold text-blue-600">{query}</span>" 的结果
            {showConfigPrompt && <span className="text-yellow-600 ml-2">(演示数据)</span>}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>翻译查询: "{data.translatedQuery}"</span>
            {!showConfigPrompt && data.rateLimit?.remaining && (
              <span className="text-orange-600">API剩余调用: {data.rateLimit.remaining}</span>
            )}
          </div>
        </div>

        {/* 结果网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>

        {/* 分页 */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set("page", (page - 1).toString())
                window.location.href = url.toString()
              }}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              第 {page} 页 / 共 {Math.ceil(totalResults / 20)} 页
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(totalResults / 20)}
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set("page", (page + 1).toString())
                window.location.href = url.toString()
              }}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Search results error:", error)
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-lg mb-4">加载失败</div>
        <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : "未知错误"}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    )
  }
}

// 单个结果卡片组件
function ResultCard({ item }: { item: SearchResult }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* 媒体类型指示器 */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              item.type === "video" ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {item.type === "video" ? "视频" : "图片"}
          </span>
        </div>

        {/* 播放按钮 */}
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* 时长 */}
        {item.duration && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(item.duration)}
            </span>
          </div>
        )}

        {/* 收藏按钮 */}
        <button className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100">
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
          {item.title || item.tags.split(", ").slice(0, 3).join(" ")}
        </h3>

        {/* 作者信息 */}
        <div className="flex items-center gap-2 mb-3">
          {item.userImageURL ? (
            <ImageWithFallback
              src={item.userImageURL || "/placeholder.svg"}
              alt={item.user}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-600">{item.user}</span>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(item.views)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatNumber(item.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(item.likes)}
            </span>
          </div>
          <span className="text-blue-600">{item.source}</span>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags
            .split(", ")
            .slice(0, 3)
            .map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <a href={item.pageURL} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full text-xs">
              <Download className="w-3 h-3 mr-1" />
              下载
            </Button>
          </a>
          <a href={item.pageURL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// 格式化数字显示
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// 格式化视频时长
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
