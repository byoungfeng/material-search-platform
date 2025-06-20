"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle, Loader2 } from "lucide-react"

export default function TranslationStatus() {
  const [translationService, setTranslationService] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    service?: string
  } | null>(null)

  const testTranslation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "商业会议" }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: `翻译成功: "商业会议" → "${data.translatedText}"`,
          service: data.source,
        })
        setTranslationService(data.source)
      } else {
        setTestResult({
          success: false,
          message: "翻译测试失败",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "翻译服务连接失败",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 自动测试翻译服务
    testTranslation()
  }, [])

  const getServiceName = (service: string) => {
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

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Globe className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-blue-800">
              <strong>翻译服务:</strong>{" "}
              {translationService ? (
                <>
                  {getServiceName(translationService)}
                  {testResult?.success && <CheckCircle className="w-4 h-4 inline ml-1 text-green-600" />}
                </>
              ) : (
                "检测中..."
              )}
            </span>
            {testResult && <div className="text-sm text-blue-700 mt-1">{testResult.message}</div>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={testTranslation}
            disabled={isLoading}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            {isLoading ? "测试中" : "重新测试"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
