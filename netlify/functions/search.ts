import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

// 添加超时配置
const TIMEOUT_MS = 8000 // 8秒超时

// 添加超时包装函数
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeoutMs)),
  ])
}

// Pixabay API配置
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "your-pixabay-api-key"
const PIXABAY_BASE_URL = "https://pixabay.com/api/"

interface PixabayImageResult {
  id: number
  pageURL: string
  type: string
  tags: string
  previewURL: string
  webformatURL: string
  largeImageURL: string
  views: number
  downloads: number
  likes: number
  user: string
  userImageURL: string
}

interface PixabayVideoResult {
  id: number
  pageURL: string
  type: string
  tags: string
  duration: number
  videos: {
    large: { url: string; width: number; height: number; size: number }
    medium: { url: string; width: number; height: number; size: number }
    small: { url: string; width: number; height: number; size: number }
    tiny: { url: string; width: number; height: number; size: number }
  }
  views: number
  downloads: number
  likes: number
  user: string
  userImageURL: string
}

// 演示图片数据
const getDemoImages = (query: string) => {
  const categories = {
    business: ["business", "office", "meeting", "corporate"],
    nature: ["nature", "landscape", "forest", "mountain"],
    technology: ["technology", "computer", "digital", "innovation"],
    food: ["food", "cooking", "restaurant", "cuisine"],
    sports: ["sports", "fitness", "exercise", "athlete"],
    city: ["city", "urban", "architecture", "building"],
    family: ["family", "people", "children", "home"],
    education: ["education", "school", "learning", "books"],
    medical: ["medical", "health", "hospital", "doctor"],
    travel: ["travel", "vacation", "tourism", "adventure"],
  }

  let category = "business"
  for (const [key, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => query.toLowerCase().includes(keyword))) {
      category = key
      break
    }
  }

  return category
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // 设置 CORS 头部
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  }

  // 处理 OPTIONS 请求
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    }
  }

  // 只允许 GET 请求
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const queryParams = event.queryStringParameters || {}
    const query = queryParams.q || ""
    const type = queryParams.type || "all"
    const page = Number.parseInt(queryParams.page || "1")

    // 验证参数
    if (!query.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Query parameter is required" }),
      }
    }

    if (page < 1 || page > 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid page number" }),
      }
    }

    // 检查API密钥配置
    const isApiKeyConfigured = PIXABAY_API_KEY && PIXABAY_API_KEY !== "your-pixabay-api-key"

    let searchResults
    let translatedText = query

    try {
      // 1. 翻译查询词
      const translationResponse = await withTimeout(
        fetch(`${event.headers.origin || "https://zhmaterial.netlify.app"}/.netlify/functions/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: query }),
        }),
        3000,
      )

      if (translationResponse.ok) {
        const translationData = await translationResponse.json()
        translatedText = translationData.translatedText || query
      }
    } catch (error) {
      console.warn("Translation failed, using original query:", error)
    }

    // 2. 搜索素材
    if (isApiKeyConfigured) {
      try {
        searchResults = await withTimeout(performPixabaySearch(translatedText, type, page), TIMEOUT_MS)
      } catch (error) {
        console.error("Pixabay API error:", error)
        searchResults = await generateMockResults(query, translatedText, type, page)
        searchResults.usingMockData = true
      }
    } else {
      searchResults = await generateMockResults(query, translatedText, type, page)
      searchResults.usingMockData = true
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        query: query,
        translatedQuery: translatedText,
        type: type,
        page: page,
        totalHits: searchResults.totalHits || 0,
        hits: searchResults.hits || [],
        usingMockData: searchResults.usingMockData || !isApiKeyConfigured,
        rateLimit: searchResults.rateLimit,
      }),
    }
  } catch (error) {
    console.error("Search API error:", error)

    const queryParams = event.queryStringParameters || {} // Declare queryParams here

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: "Search service temporarily unavailable",
        query: queryParams.q || "",
        translatedQuery: queryParams.q || "",
        type: queryParams.type || "all",
        page: Number.parseInt(queryParams.page || "1"),
        totalHits: 0,
        hits: [],
        usingMockData: true,
      }),
    }
  }
}

// 统一的Pixabay搜索函数
async function performPixabaySearch(query: string, type: string, page: number) {
  if (type === "videos") {
    return await searchPixabayVideos(query, page)
  } else if (type === "photos") {
    return await searchPixabayImages(query, page)
  } else {
    try {
      const [imageResults, videoResults] = await Promise.allSettled([
        searchPixabayImages(query, page, 10),
        searchPixabayVideos(query, page, 10),
      ])

      const images = imageResults.status === "fulfilled" ? imageResults.value : { totalHits: 0, hits: [] }
      const videos = videoResults.status === "fulfilled" ? videoResults.value : { totalHits: 0, hits: [] }

      return {
        totalHits: images.totalHits + videos.totalHits,
        hits: [...images.hits, ...videos.hits],
        rateLimit: images.rateLimit || videos.rateLimit,
      }
    } catch (error) {
      console.error("Parallel search failed:", error)
      return await searchPixabayImages(query, page)
    }
  }
}

// 模拟数据生成函数
async function generateMockResults(originalQuery: string, translatedQuery: string, type: string, page: number) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const baseResults = [
    {
      id: 1,
      type: "photo",
      title: `${originalQuery} - 专业摄影作品`,
      thumbnail: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`,
      previewURL: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`,
      largeImageURL: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center`,
      pageURL: "https://pixabay.com/photos/demo-1",
      tags: `${translatedQuery}, professional, stock, demo`,
      views: 15234,
      downloads: 3421,
      likes: 892,
      user: "DemoPhotographer",
      userImageURL: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`,
      source: "Pixabay (演示)",
    },
    {
      id: 2,
      type: "video",
      title: `${originalQuery} - 高清视频素材`,
      thumbnail: `https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&crop=center`,
      videoURL: `https://images.unsplash.com/photo-1551434678-e076c223a692?w=640&h=480&fit=crop&crop=center`,
      duration: 45,
      pageURL: "https://pixabay.com/videos/demo-2",
      tags: `${translatedQuery}, video, hd, demo`,
      views: 8765,
      downloads: 2134,
      likes: 456,
      user: "VideoCreator",
      userImageURL: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face`,
      source: "Pixabay (演示)",
    },
    {
      id: 3,
      type: "photo",
      title: `${originalQuery} - 创意设计素材`,
      thumbnail: `https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&crop=center`,
      previewURL: `https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&crop=center`,
      largeImageURL: `https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center`,
      pageURL: "https://pixabay.com/photos/demo-3",
      tags: `${translatedQuery}, creative, design, demo`,
      views: 12456,
      downloads: 2876,
      likes: 634,
      user: "DesignStudio",
      userImageURL: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face`,
      source: "Pixabay (演示)",
    },
    {
      id: 4,
      type: "video",
      title: `${originalQuery} - 动态背景视频`,
      thumbnail: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center`,
      videoURL: `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=480&fit=crop&crop=center`,
      duration: 120,
      pageURL: "https://pixabay.com/videos/demo-4",
      tags: `${translatedQuery}, background, motion, demo`,
      views: 19876,
      downloads: 4321,
      likes: 987,
      user: "MotionGraphics",
      userImageURL: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face`,
      source: "Pixabay (演示)",
    },
  ]

  // 根据类型过滤
  let filteredResults = baseResults
  if (type !== "all") {
    filteredResults = baseResults.filter((item) => {
      if (type === "videos") return item.type === "video"
      if (type === "photos") return item.type === "photo"
      return false
    })
  }

  // 生成分页结果
  const resultsPerPage = 20
  const hits = []
  for (let i = 0; i < resultsPerPage; i++) {
    const baseItem = filteredResults[i % filteredResults.length]
    const imageId = 1560472354 + i
    hits.push({
      ...baseItem,
      id: (page - 1) * resultsPerPage + i + 1,
      title: `${baseItem.title} ${i + 1}`,
      thumbnail:
        baseItem.type === "photo"
          ? `https://images.unsplash.com/photo-${imageId}-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`
          : `https://images.unsplash.com/photo-${imageId}-e076c223a692?w=400&h=300&fit=crop&crop=center`,
      previewURL:
        baseItem.type === "photo"
          ? `https://images.unsplash.com/photo-${imageId}-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`
          : undefined,
      largeImageURL:
        baseItem.type === "photo"
          ? `https://images.unsplash.com/photo-${imageId}-b33ff0c44a43?w=800&h=600&fit=crop&crop=center`
          : undefined,
    })
  }

  return {
    totalHits: 1247,
    hits: hits,
  }
}

// 搜索Pixabay图片
async function searchPixabayImages(query: string, page: number, perPage = 20) {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: query.slice(0, 100),
    image_type: "photo",
    orientation: "all",
    category: "",
    min_width: "0",
    min_height: "0",
    order: "popular",
    page: Math.min(page, 50).toString(),
    per_page: Math.min(perPage, 200).toString(),
    safesearch: "true",
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${PIXABAY_BASE_URL}?${params}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SearchBot/1.0)",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    return {
      totalHits: data.totalHits || 0,
      hits: (data.hits || []).map((item: PixabayImageResult) => ({
        id: item.id,
        type: "photo",
        title: item.tags.split(", ").slice(0, 3).join(" "),
        thumbnail: item.webformatURL,
        previewURL: item.previewURL,
        largeImageURL: item.largeImageURL,
        pageURL: item.pageURL,
        tags: item.tags,
        views: item.views || 0,
        downloads: item.downloads || 0,
        likes: item.likes || 0,
        user: item.user || "Unknown",
        userImageURL: item.userImageURL || "",
        source: "Pixabay",
      })),
      rateLimit: {
        remaining: response.headers.get("X-RateLimit-Remaining"),
        reset: response.headers.get("X-RateLimit-Reset"),
      },
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error("Pixabay images search failed:", error)
    throw error
  }
}

// 搜索Pixabay视频
async function searchPixabayVideos(query: string, page: number, perPage = 20) {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: query.slice(0, 100),
    video_type: "all",
    category: "",
    min_width: "0",
    min_height: "0",
    order: "popular",
    page: Math.min(page, 50).toString(),
    per_page: Math.min(perPage, 200).toString(),
    safesearch: "true",
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${PIXABAY_BASE_URL}videos/?${params}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SearchBot/1.0)",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    return {
      totalHits: data.totalHits || 0,
      hits: (data.hits || []).map((item: PixabayVideoResult) => ({
        id: item.id,
        type: "video",
        title: item.tags.split(", ").slice(0, 3).join(" "),
        thumbnail: item.videos?.small?.url || "",
        videoURL: item.videos?.medium?.url || "",
        duration: item.duration || 0,
        pageURL: item.pageURL,
        tags: item.tags,
        views: item.views || 0,
        downloads: item.downloads || 0,
        likes: item.likes || 0,
        user: item.user || "Unknown",
        userImageURL: item.userImageURL || "",
        source: "Pixabay",
      })),
      rateLimit: {
        remaining: response.headers.get("X-RateLimit-Remaining"),
        reset: response.headers.get("X-RateLimit-Reset"),
      },
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error("Pixabay videos search failed:", error)
    throw error
  }
}
