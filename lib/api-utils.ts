// API配置检查工具
export async function checkApiConfiguration() {
  try {
    const response = await fetch("/api/search?q=test&type=photos&page=1")
    const data = await response.json()

    return {
      isConfigured: !data.usingMockData,
      hasError: !!data.error,
      rateLimit: data.rateLimit,
      totalHits: data.totalHits,
    }
  } catch (error) {
    return {
      isConfigured: false,
      hasError: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// 验证API密钥格式
export function validateApiKeyFormat(apiKey: string): boolean {
  // Pixabay API密钥格式: 数字-32位十六进制字符串
  const pixabayKeyPattern = /^\d+-[a-f0-9]{32}$/i
  return pixabayKeyPattern.test(apiKey)
}

// 格式化API限制信息
export function formatRateLimit(rateLimit: any) {
  if (!rateLimit) return null

  return {
    remaining: rateLimit.remaining ? Number.parseInt(rateLimit.remaining) : null,
    reset: rateLimit.reset ? new Date(Number.parseInt(rateLimit.reset) * 1000) : null,
  }
}
