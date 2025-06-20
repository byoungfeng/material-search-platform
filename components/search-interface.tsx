"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Mic, Camera, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const searchSuggestions = [
  "商业会议",
  "自然风景",
  "科技办公",
  "美食烹饪",
  "运动健身",
  "城市夜景",
  "家庭生活",
  "教育学习",
  "医疗健康",
  "旅行度假",
]

const contentTypes = [
  { id: "all", label: "全部", icon: Search },
  { id: "videos", label: "视频", icon: Camera },
  { id: "photos", label: "图片", icon: Camera },
  { id: "music", label: "音乐", icon: Music },
]

export default function SearchInterface() {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim()) {
      const filtered = searchSuggestions.filter(
        (suggestion) => suggestion.includes(query) || query.includes(suggestion.charAt(0)),
      )
      setFilteredSuggestions(filtered.slice(0, 5))
    } else {
      setFilteredSuggestions([])
    }
  }, [query])

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (finalQuery.trim()) {
      // 保存搜索历史到本地存储
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]")
      const newHistory = [finalQuery, ...history.filter((item: string) => item !== finalQuery)].slice(0, 10)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))

      router.push(`/search?q=${encodeURIComponent(finalQuery)}&type=${selectedType}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
      setShowSuggestions(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 内容类型选择 */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white rounded-full p-1 shadow-md">
          {contentTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedType === type.id ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="输入中文关键词搜索素材..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-12 pr-24 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 shadow-lg"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-full p-2 hover:bg-gray-100">
              <Mic className="w-4 h-4 text-gray-500" />
            </Button>
            <Button onClick={() => handleSearch()} className="rounded-full px-6 bg-blue-500 hover:bg-blue-600">
              搜索
            </Button>
          </div>
        </div>

        {/* 搜索建议 */}
        {showSuggestions && (query.trim() || filteredSuggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-10">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    handleSearch(suggestion)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">输入关键词开始搜索</div>
            )}
          </div>
        )}
      </div>

      {/* 热门搜索标签 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">热门搜索：</p>
        <div className="flex flex-wrap justify-center gap-2">
          {searchSuggestions.slice(0, 6).map((tag, index) => (
            <button
              key={index}
              onClick={() => handleSearch(tag)}
              className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
