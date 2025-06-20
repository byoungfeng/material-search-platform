import { type NextRequest, NextResponse } from "next/server"

// Pixabay API配置
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "your-pixabay-api-key"
const PIXABAY_BASE_URL = "https://pixabay.com/api/"

interface PixabaySearchParams {
  q: string
  type: string
  page: number
  per_page?: number
  category?: string
  min_width?: number
  min_height?: number
  order?: string
  safesearch?: boolean
}

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

// 演示图片数据 - 使用Unsplash作为演示图片源
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

  // 根据查询词选择合适的类别
  let category = "business"
  for (const [key, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => query.toLowerCase().includes(keyword))) {
      category = key
      break
    }
  }

  return category
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")

    if (!query.trim()) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // 检查API密钥配置
    const isApiKeyConfigured = PIXABAY_API_KEY && PIXABAY_API_KEY !== "your-pixabay-api-key"

    // 1. 翻译查询词
    const translationResponse = await fetch(`${request.nextUrl.origin}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
    })

    const { translatedText } = await translationResponse.json()

    // 2. 根据API密钥配置决定使用真实API还是模拟数据
    let searchResults
    if (isApiKeyConfigured) {
      // 使用真实Pixabay API
      if (type === "videos") {
        searchResults = await searchPixabayVideos(translatedText, page)
      } else if (type === "photos") {
        searchResults = await searchPixabayImages(translatedText, page)
      } else {
        const [imageResults, videoResults] = await Promise.all([
          searchPixabayImages(translatedText, page, 10),
          searchPixabayVideos(translatedText, page, 10),
        ])
        searchResults = {
          totalHits: imageResults.totalHits + videoResults.totalHits,
          hits: [...imageResults.hits, ...videoResults.hits],
        }
      }
    } else {
      // 使用模拟数据
      searchResults = await generateMockResults(query, translatedText, type, page)
    }

    return NextResponse.json({
      query: query,
      translatedQuery: translatedText,
      type: type,
      page: page,
      totalHits: searchResults.totalHits,
      hits: searchResults.hits,
      usingMockData: !isApiKeyConfigured,
      rateLimit: searchResults.rateLimit,
    })
  } catch (error) {
    console.error("Search API error:", error)

    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json({ error: "API rate limit exceeded. Please try again later." }, { status: 429 })
    }

    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

// 改进的模拟数据生成函数
async function generateMockResults(originalQuery: string, translatedQuery: string, type: string, page: number) {
  await new Promise((resolve) => setTimeout(resolve, 300)) // 模拟API延迟

  const category = getDemoImages(translatedQuery)

  // 使用Unsplash作为演示图片源
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
    const imageId = 1560472354 + i // 使用不同的Unsplash图片ID
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
    q: query,
    image_type: "photo",
    orientation: "all",
    category: "",
    min_width: "0",
    min_height: "0",
    order: "popular",
    page: page.toString(),
    per_page: perPage.toString(),
    safesearch: "true",
  })

  const response = await fetch(`${PIXABAY_BASE_URL}?${params}`)

  // 检查速率限制
  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining")
  const rateLimitReset = response.headers.get("X-RateLimit-Reset")

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Pixabay API rate limit exceeded")
    }
    throw new Error(`Pixabay API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    totalHits: data.totalHits,
    hits: data.hits.map((item: PixabayImageResult) => ({
      id: item.id,
      type: "photo",
      title: item.tags.split(", ").slice(0, 3).join(" "),
      thumbnail: item.webformatURL,
      previewURL: item.previewURL,
      largeImageURL: item.largeImageURL,
      pageURL: item.pageURL,
      tags: item.tags,
      views: item.views,
      downloads: item.downloads,
      likes: item.likes,
      user: item.user,
      userImageURL: item.userImageURL,
      source: "Pixabay",
    })),
    rateLimit: {
      remaining: rateLimitRemaining,
      reset: rateLimitReset,
    },
  }
}

// 搜索Pixabay视频
async function searchPixabayVideos(query: string, page: number, perPage = 20) {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: query,
    video_type: "all",
    category: "",
    min_width: "0",
    min_height: "0",
    order: "popular",
    page: page.toString(),
    per_page: perPage.toString(),
    safesearch: "true",
  })

  const response = await fetch(`${PIXABAY_BASE_URL}videos/?${params}`)

  // 检查速率限制
  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining")
  const rateLimitReset = response.headers.get("X-RateLimit-Reset")

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Pixabay API rate limit exceeded")
    }
    throw new Error(`Pixabay API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    totalHits: data.totalHits,
    hits: data.hits.map((item: PixabayVideoResult) => ({
      id: item.id,
      type: "video",
      title: item.tags.split(", ").slice(0, 3).join(" "),
      thumbnail: item.videos.small.url,
      videoURL: item.videos.medium.url,
      duration: item.duration,
      pageURL: item.pageURL,
      tags: item.tags,
      views: item.views,
      downloads: item.downloads,
      likes: item.likes,
      user: item.user,
      userImageURL: item.userImageURL,
      source: "Pixabay",
    })),
    rateLimit: {
      remaining: rateLimitRemaining,
      reset: rateLimitReset,
    },
  }
}
