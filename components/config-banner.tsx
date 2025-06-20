"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Settings, X, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ConfigBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 检查是否已配置API密钥
    const checkApiConfig = async () => {
      try {
        const response = await fetch("/api/search?q=test&type=photos&page=1")
        const data = await response.json()

        if (!data.usingMockData) {
          setIsConfigured(true)
          return
        }
      } catch (error) {
        console.log("API check failed:", error)
      }

      // 如果API未配置，检查是否已被用户关闭
      const dismissed = localStorage.getItem("config_banner_dismissed")
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    checkApiConfig()
  }, [])

  const dismissBanner = () => {
    setIsDismissed(true)
    setShowBanner(false)
    localStorage.setItem("config_banner_dismissed", "true")
  }

  // 如果已配置API密钥，显示成功状态
  if (isConfigured) {
    return (
      <div className="bg-green-600 text-white">
        <div className="container mx-auto px-4 py-2">
          <Alert className="border-green-500 bg-green-600 text-white">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                ✅ <strong>API已配置：</strong>正在使用真实的Pixabay数据，享受高质量素材搜索体验！
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!showBanner || isDismissed) {
    return null
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-blue-500 bg-blue-600 text-white">
          <Settings className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              🚀 <strong>提升体验：</strong>配置Pixabay API密钥以获取真实的高质量素材数据，目前显示的是演示内容。
            </span>
            <div className="flex items-center gap-2 ml-4">
              <Link href="/config">
                <Button variant="secondary" size="sm">
                  立即配置
                </Button>
              </Link>
              <button onClick={dismissBanner} className="p-1 hover:bg-blue-700 rounded" aria-label="关闭提示">
                <X className="h-4 w-4" />
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
