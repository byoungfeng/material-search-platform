"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ConfigPage() {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    details?: any
  } | null>(null)

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: "请输入API密钥",
      })
      return
    }

    setIsValidating(true)
    try {
      // 测试API密钥 - 调用一个简单的搜索请求
      const testUrl = `https://pixabay.com/api/?key=${apiKey}&q=test&per_page=3`
      const response = await fetch(testUrl)

      if (response.ok) {
        const data = await response.json()
        setValidationResult({
          isValid: true,
          message: `API密钥验证成功！找到 ${data.totalHits} 个结果`,
          details: {
            totalHits: data.totalHits,
            rateLimit: {
              remaining: response.headers.get("X-RateLimit-Remaining"),
              reset: response.headers.get("X-RateLimit-Reset"),
            },
          },
        })

        // 保存到本地存储
        localStorage.setItem("pixabay_api_key", apiKey)
      } else {
        const errorData = await response.json()
        setValidationResult({
          isValid: false,
          message: `API密钥无效: ${errorData.error || response.statusText}`,
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "验证失败，请检查网络连接或API密钥格式",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const testCurrentConfig = async () => {
    setIsValidating(true)
    try {
      // 测试当前环境变量中的API密钥
      const response = await fetch("/api/search?q=test&type=photos&page=1")
      const data = await response.json()

      if (data.usingMockData) {
        setValidationResult({
          isValid: false,
          message: "当前使用演示数据，环境变量中未配置有效的API密钥",
        })
      } else {
        setValidationResult({
          isValid: true,
          message: `环境变量配置正确！找到 ${data.totalHits} 个结果`,
          details: data,
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "测试失败，请检查配置",
      })
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    // 从本地存储加载API密钥
    const savedKey = localStorage.getItem("pixabay_api_key")
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API配置
            </CardTitle>
            <CardDescription>配置Pixabay API密钥以获取真实的素材数据</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 当前配置状态 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">当前配置状态</h3>
              <p className="text-sm text-blue-800 mb-3">检查环境变量中的API密钥配置是否正常工作</p>
              <Button onClick={testCurrentConfig} disabled={isValidating} size="sm" variant="outline">
                {isValidating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                测试当前配置
              </Button>
            </div>

            {/* Pixabay API配置 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pixabay-key">Pixabay API密钥</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="pixabay-key"
                    type="password"
                    placeholder="33978214-36832c2d90534493d357fa7cb"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={validateApiKey} disabled={isValidating} size="sm">
                      {isValidating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {isValidating ? "验证中..." : "验证密钥"}
                    </Button>
                    <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        获取API密钥
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* 验证结果 */}
              {validationResult && (
                <Alert
                  className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <div className="flex items-start gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription className={validationResult.isValid ? "text-green-800" : "text-red-800"}>
                        {validationResult.message}
                      </AlertDescription>
                      {validationResult.details && validationResult.isValid && (
                        <div className="mt-2 text-xs text-green-700">
                          <p>API调用剩余次数: {validationResult.details.rateLimit?.remaining || "未知"}</p>
                          <p>总结果数: {validationResult.details.totalHits?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
            </div>

            {/* 使用说明 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">如何获取Pixabay API密钥：</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>
                  访问{" "}
                  <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Pixabay官网
                  </a>{" "}
                  并注册账号
                </li>
                <li>
                  登录后访问{" "}
                  <a
                    href="https://pixabay.com/api/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    API文档页面
                  </a>
                </li>
                <li>在页面中找到您的API密钥</li>
                <li>复制密钥并粘贴到上方输入框中</li>
                <li>点击"验证密钥"确认配置正确</li>
              </ol>
            </div>

            {/* 环境变量配置说明 */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">生产环境配置：</h3>
              <div className="text-sm text-green-800 space-y-2">
                <p>在生产环境中，请将API密钥配置为环境变量：</p>
                <div className="bg-green-100 p-2 rounded font-mono text-xs">
                  PIXABAY_API_KEY=33978214-36832c2d90534493d357fa7cb
                </div>
                <p>在Vercel部署时，可以在项目设置的Environment Variables中添加此配置。</p>
              </div>
            </div>

            {/* API限制说明 */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">API使用限制：</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>免费账户：每小时100次请求</li>
                <li>请求需要缓存24小时</li>
                <li>不允许批量下载</li>
                <li>图片URL仅用于临时显示</li>
                <li>商业使用需要遵循Pixabay许可协议</li>
              </ul>
            </div>

            {/* 快速测试 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">快速测试</h3>
              <p className="text-sm text-gray-700 mb-3">配置完成后，您可以立即测试搜索功能</p>
              <div className="flex gap-2">
                <Link href="/search?q=商业会议&type=all&page=1">
                  <Button variant="outline" size="sm">
                    测试搜索
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="sm">返回首页</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
