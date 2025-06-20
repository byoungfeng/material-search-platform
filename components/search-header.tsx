"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, User, Heart, History, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SearchHeaderProps {
  initialQuery: string
  initialType: string
}

export default function SearchHeader({ initialQuery, initialType }: SearchHeaderProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查登录状态
    const loginStatus = localStorage.getItem("isLoggedIn")
    setIsLoggedIn(loginStatus === "true")
  }, [])

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${initialType}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">素材搜索</span>
          </Link>

          {/* 搜索框 */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="搜索视频、图片、音乐素材..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-20"
              />
              <Button onClick={handleSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2" size="sm">
                搜索
              </Button>
            </div>
          </div>

          {/* 用户操作 */}
          <div className="flex items-center gap-4">
            <Link href="/translation">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">翻译</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden md:inline">历史</span>
            </Button>

            {isLoggedIn ? (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="hidden md:inline">收藏</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">我的</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">登录</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
