"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Play, Download, Heart, Clock, Eye, ImageIcon } from "lucide-react"
import { useState } from "react"

// 图片加载组件
function ImageWithFallback({
  src,
  alt,
  className,
  ...props
}: {
  src: string
  alt: string
  className?: string
  [key: string]: any
}) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  )
}

const popularItems = [
  {
    id: 1,
    type: "video",
    title: "商业会议讨论 - Business Meeting Discussion",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
    duration: "0:45",
    views: "12.5K",
    downloads: "2.1K",
    tags: ["business", "meeting", "office"],
  },
  {
    id: 2,
    type: "photo",
    title: "自然风景日落 - Mountain Landscape Sunset",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
    views: "8.3K",
    downloads: "1.8K",
    tags: ["nature", "landscape", "sunset"],
  },
  {
    id: 3,
    type: "video",
    title: "科技创新办公 - Technology Innovation Office",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&crop=center",
    duration: "1:20",
    views: "15.2K",
    downloads: "3.4K",
    tags: ["technology", "innovation", "digital"],
  },
  {
    id: 4,
    type: "photo",
    title: "美食摄影布置 - Food Photography Setup",
    thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
    views: "6.7K",
    downloads: "1.2K",
    tags: ["food", "photography", "cooking"],
  },
  {
    id: 5,
    type: "video",
    title: "城市夜景延时 - City Night Timelapse",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center",
    duration: "2:15",
    views: "18.9K",
    downloads: "4.2K",
    tags: ["city", "night", "timelapse"],
  },
  {
    id: 6,
    type: "photo",
    title: "团队合作办公 - Team Collaboration",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&crop=center",
    views: "11.4K",
    downloads: "2.8K",
    tags: ["team", "collaboration", "work"],
  },
]

export default function PopularContent() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">热门素材推荐</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {popularItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative">
              <ImageWithFallback
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* 视频播放按钮 */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {/* 时长标签 */}
              {item.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.duration}
                </div>
              )}

              {/* 收藏按钮 */}
              <button className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100">
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {item.downloads}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
