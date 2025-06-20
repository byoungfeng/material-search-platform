"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"
import Link from "next/link"

interface ApiStatusProps {
  usingMockData?: boolean
  rateLimit?: {
    remaining: string | null
    reset: string | null
  }
}

export default function ApiStatus({ usingMockData, rateLimit }: ApiStatusProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (usingMockData) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 mb-6">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <span className="text-yellow-800">
              <strong>演示模式：</strong>当前显示演示数据。配置API密钥以获取真实素材。
            </span>
          </div>
          <Link href="/config">
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
              配置API
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  const remaining = rateLimit?.remaining ? Number.parseInt(rateLimit.remaining) : null
  const resetTime = rateLimit?.reset ? new Date(Number.parseInt(rateLimit.reset) * 1000) : null

  return (
    <Alert className="border-green-200 bg-green-50 mb-6">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-green-800">
              <strong>API已激活：</strong>正在使用真实Pixabay数据
            </span>
            {remaining !== null && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Zap className="w-3 h-3" />
                <span>剩余调用: {remaining}/100</span>
                {resetTime && (
                  <>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>重置时间: {resetTime.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            {showDetails ? "隐藏详情" : "查看详情"}
          </Button>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>API状态:</strong> 正常运行
              </div>
              <div>
                <strong>数据源:</strong> Pixabay官方API
              </div>
              <div>
                <strong>更新频率:</strong> 实时
              </div>
              <div>
                <strong>内容质量:</strong> 经过审核的高质量素材
              </div>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
