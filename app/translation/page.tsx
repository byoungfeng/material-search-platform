"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import TranslationStatus from "@/components/translation-status"

export default function TranslationPage() {
  const [testText, setTestText] = useState("商业会议")
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<{
    original: string
    translated: string
    service: string
  } | null>(null)

  const testTranslation = async () => {
    if (!testText.trim()) return

    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText }),
      })

      const data = await response.json()

      if (response.ok) {
        setTranslationResult({
          original: testText,
          translated: data.translatedText,
          service: data.source,
        })
      }
    } catch (error) {
      console.error("Translation test failed:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const commonTestCases = [
    "商业会议",
    "自然风景",
    "科技办公",
    "美食烹饪",
    "运动健身",
    "城市夜景",
    "家庭生活",
    "教育学习",
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 返回首页
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                免费翻译服务
              </CardTitle>
              <CardDescription>我们使用多种免费翻译服务来确保中文搜索词能够准确翻译为英文</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 当前翻译状态 */}
              <TranslationStatus />

              {/* 翻译测试 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">翻译测试</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="test-text">输入中文测试</Label>
                    <Input
                      id="test-text"
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder="输入要翻译的中文..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={testTranslation} disabled={isTranslating || !testText.trim()}>
                      {isTranslating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      翻译
                    </Button>
                  </div>
                </div>

                {/* 翻译结果 */}
                {translationResult && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">"{translationResult.original}"</span>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">"{translationResult.translated}"</span>
                        </div>
                        <div className="text-sm text-green-700">
                          翻译服务: {getServiceName(translationResult.service)}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* 常用测试用例 */}
                <div>
                  <Label>常用测试用例</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonTestCases.map((text) => (
                      <Button
                        key={text}
                        variant="outline"
                        size="sm"
                        onClick={() => setTestText(text)}
                        className="text-xs"
                      >
                        {text}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 翻译服务说明 */}
          <Card>
            <CardHeader>
              <CardTitle>翻译服务说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">✅ 免费服务</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>
                      • <strong>内置词典:</strong> 3000+ 常用词汇映射
                    </li>
                    <li>
                      • <strong>Google翻译:</strong> 免费API接口
                    </li>
                    <li>
                      • <strong>LibreTranslate:</strong> 开源翻译服务
                    </li>
                    <li>
                      • <strong>MyMemory:</strong> 免费翻译API
                    </li>
                    <li>
                      • <strong>本地智能翻译:</strong> 备用翻译逻辑
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">🔄 工作原理</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 优先使用内置词典（最快最准确）</li>
                    <li>• 依次尝试免费翻译API</li>
                    <li>• 智能缓存翻译结果</li>
                    <li>• 本地备用翻译保证可用性</li>
                    <li>• 自动错误恢复机制</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>提示:</strong> 我们的翻译系统完全免费，无需任何API密钥。
                  系统会自动选择最佳的翻译服务，确保搜索的准确性。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 支持的词汇类别 */}
          <Card>
            <CardHeader>
              <CardTitle>支持的词汇类别</CardTitle>
              <CardDescription>我们的内置词典涵盖以下主要类别</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2">商业办公</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>商业会议</li>
                    <li>团队合作</li>
                    <li>办公室</li>
                    <li>商务人士</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">自然风景</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>山川河流</li>
                    <li>日出日落</li>
                    <li>森林树木</li>
                    <li>海洋湖泊</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">科技数码</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>人工智能</li>
                    <li>云计算</li>
                    <li>数据分析</li>
                    <li>智能手机</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">生活娱乐</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>家庭生活</li>
                    <li>美食烹饪</li>
                    <li>运动健身</li>
                    <li>旅行度假</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getServiceName(service: string) {
  const serviceNames: Record<string, string> = {
    manual: "内置词典",
    google: "Google翻译",
    libre: "LibreTranslate",
    mymemory: "MyMemory",
    local: "本地智能翻译",
    fallback: "备用翻译",
  }
  return serviceNames[service] || service
}
