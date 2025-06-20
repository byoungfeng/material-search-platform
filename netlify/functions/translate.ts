import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

// 翻译缓存
const translationCache = new Map<string, string>()

// 扩展的手动翻译映射
const manualTranslations: Record<string, string> = {
  // 基础词汇
  商业会议: "business meeting",
  自然风景: "nature landscape",
  科技办公: "technology office",
  美食烹饪: "food cooking",
  运动健身: "sports fitness",
  城市夜景: "city night",
  家庭生活: "family life",
  教育学习: "education learning",
  医疗健康: "medical health",
  旅行度假: "travel vacation",

  // 商业相关
  商务人士: "business people",
  团队合作: "teamwork",
  办公室: "office",
  会议室: "meeting room",
  商业谈判: "business negotiation",
  企业文化: "corporate culture",
  工作场所: "workplace",
  商业演示: "business presentation",
  职场: "workplace",
  创业: "startup",

  // 自然相关
  山川河流: "mountains rivers",
  森林树木: "forest trees",
  海洋湖泊: "ocean lake",
  日出日落: "sunrise sunset",
  四季风景: "seasonal landscape",
  花卉植物: "flowers plants",
  动物世界: "animal world",
  蓝天白云: "blue sky white clouds",
  绿色环保: "green environmental",
  自然保护: "nature conservation",

  // 科技相关
  人工智能: "artificial intelligence",
  机器学习: "machine learning",
  数据分析: "data analysis",
  云计算: "cloud computing",
  物联网: "internet of things",
  区块链: "blockchain",
  虚拟现实: "virtual reality",
  增强现实: "augmented reality",
  智能手机: "smartphone",
  电脑技术: "computer technology",

  // 生活相关
  家庭聚餐: "family dinner",
  儿童玩耍: "children playing",
  宠物动物: "pets animals",
  居家生活: "home life",
  购物消费: "shopping consumption",
  休闲娱乐: "leisure entertainment",
  节日庆祝: "holiday celebration",
  生日派对: "birthday party",
  婚礼庆典: "wedding ceremony",
  毕业典礼: "graduation ceremony",

  // 艺术设计
  创意设计: "creative design",
  时尚潮流: "fashion trend",
  建筑设计: "architecture design",
  室内装修: "interior decoration",
  艺术创作: "artistic creation",
  摄影作品: "photography work",
  绘画艺术: "painting art",
  雕塑艺术: "sculpture art",
  音乐表演: "music performance",
  舞蹈表演: "dance performance",

  // 教育相关
  学校教育: "school education",
  在线学习: "online learning",
  图书馆: "library",
  实验室: "laboratory",
  课堂教学: "classroom teaching",
  学生学习: "student learning",
  教师授课: "teacher teaching",
  考试测试: "exam test",
  毕业证书: "graduation certificate",
  学术研究: "academic research",

  // 医疗健康
  医院诊所: "hospital clinic",
  医生护士: "doctor nurse",
  健康检查: "health checkup",
  药品医疗: "medicine medical",
  手术治疗: "surgery treatment",
  康复训练: "rehabilitation training",
  心理健康: "mental health",
  营养饮食: "nutrition diet",
  健身运动: "fitness exercise",
  瑜伽冥想: "yoga meditation",

  // 旅行交通
  旅游景点: "tourist attractions",
  酒店住宿: "hotel accommodation",
  交通工具: "transportation",
  飞机航班: "airplane flight",
  火车地铁: "train subway",
  汽车驾驶: "car driving",
  自行车: "bicycle",
  徒步旅行: "hiking travel",
  海滩度假: "beach vacation",
  山地探险: "mountain adventure",

  // 食物饮品
  中式料理: "chinese cuisine",
  西式料理: "western cuisine",
  日式料理: "japanese cuisine",
  意式料理: "italian cuisine",
  快餐食品: "fast food",
  健康饮食: "healthy diet",
  素食主义: "vegetarian",
  咖啡饮品: "coffee drinks",
  茶文化: "tea culture",
  烘焙甜点: "baking dessert",

  // 体育运动
  足球比赛: "football match",
  篮球比赛: "basketball game",
  网球运动: "tennis sport",
  游泳运动: "swimming sport",
  跑步锻炼: "running exercise",
  健身房: "gym fitness",
  瑜伽练习: "yoga practice",
  武术功夫: "martial arts",
  极限运动: "extreme sports",
  户外运动: "outdoor sports",
}

const TRANSLATION_TIMEOUT = 3000

// 免费翻译API选项
const FREE_TRANSLATION_APIS = {
  google: async (text: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=en&dt=t&q=${encodeURIComponent(text)}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
      )

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const translated = data[0]?.[0]?.[0]
        return translated && translated !== text ? translated : null
      }
    } catch (error) {
      console.log("Google翻译失败:", error)
    }
    return null
  },

  libre: async (text: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "zh",
          target: "en",
          format: "text",
        }),
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const translated = data.translatedText
        return translated && translated !== text ? translated : null
      }
    } catch (error) {
      console.log("LibreTranslate翻译失败:", error)
    }
    return null
  },

  mymemory: async (text: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|en`,
        {
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.responseStatus === 200) {
          const translated = data.responseData.translatedText
          return translated && translated !== text ? translated : null
        }
      }
    } catch (error) {
      console.log("MyMemory翻译失败:", error)
    }
    return null
  },
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  }

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = JSON.parse(event.body || "{}")
    const { text } = body

    if (!text || typeof text !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid text parameter" }),
      }
    }

    const cleanText = text.trim().slice(0, 500)

    // 检查缓存
    if (translationCache.has(cleanText)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          translatedText: translationCache.get(cleanText),
          cached: true,
        }),
      }
    }

    // 检查手动翻译映射
    if (manualTranslations[cleanText]) {
      const translation = manualTranslations[cleanText]
      translationCache.set(cleanText, translation)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          translatedText: translation,
          source: "manual",
        }),
      }
    }

    // 尝试免费翻译API
    let translatedText = null
    let usedService = null

    for (const [serviceName, translateFn] of Object.entries(FREE_TRANSLATION_APIS)) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Translation timeout")), TRANSLATION_TIMEOUT),
        )

        translatedText = await Promise.race([translateFn(cleanText), timeoutPromise])

        if (translatedText && translatedText !== cleanText) {
          usedService = serviceName
          break
        }
      } catch (error) {
        console.log(`${serviceName} 翻译失败:`, error)
        continue
      }
    }

    // 如果所有免费API都失败，使用本地智能翻译
    if (!translatedText) {
      translatedText = await translateLocally(cleanText)
      usedService = "local"
    }

    // 缓存结果
    translationCache.set(cleanText, translatedText)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        translatedText: translatedText,
        source: usedService,
      }),
    }
  } catch (error) {
    console.error("Translation error:", error)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        translatedText: "search content",
        source: "default",
      }),
    }
  }
}

// 本地翻译逻辑
async function translateLocally(text: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const commonTranslations: Record<string, string> = {
    视频: "video",
    图片: "image",
    照片: "photo",
    音乐: "music",
    背景: "background",
    素材: "material",
    内容: "content",
    资源: "resource",
    商务: "business",
    商业: "business",
    会议: "meeting",
    办公: "office",
    工作: "work",
    团队: "team",
    合作: "cooperation",
    企业: "enterprise",
    公司: "company",
    职业: "professional",
    自然: "nature",
    风景: "landscape",
    山: "mountain",
    海: "sea",
    河: "river",
    湖: "lake",
    树: "tree",
    花: "flower",
    草: "grass",
    动物: "animal",
    鸟: "bird",
    鱼: "fish",
    科技: "technology",
    技术: "technology",
    电脑: "computer",
    手机: "mobile",
    网络: "network",
    数据: "data",
    软件: "software",
    硬件: "hardware",
    互联网: "internet",
    人工智能: "artificial intelligence",
    美食: "food",
    烹饪: "cooking",
    运动: "sports",
    健身: "fitness",
    家庭: "family",
    生活: "life",
    房子: "house",
    汽车: "car",
    购物: "shopping",
    娱乐: "entertainment",
    艺术: "art",
    设计: "design",
    创意: "creative",
    时尚: "fashion",
    建筑: "architecture",
    音乐: "music",
    绘画: "painting",
    摄影: "photography",
    电影: "movie",
    文化: "culture",
    教育: "education",
    学习: "learning",
    学校: "school",
    学生: "student",
    老师: "teacher",
    书: "book",
    知识: "knowledge",
    研究: "research",
    科学: "science",
    历史: "history",
    医疗: "medical",
    健康: "health",
    医院: "hospital",
    医生: "doctor",
    护士: "nurse",
    药: "medicine",
    治疗: "treatment",
    手术: "surgery",
    检查: "examination",
    康复: "rehabilitation",
    旅行: "travel",
    度假: "vacation",
    城市: "city",
    国家: "country",
    酒店: "hotel",
    飞机: "airplane",
    火车: "train",
    汽车: "car",
    地图: "map",
    景点: "attraction",
    日出: "sunrise",
    日落: "sunset",
    夜晚: "night",
    白天: "day",
    早晨: "morning",
    下午: "afternoon",
    晚上: "evening",
    春天: "spring",
    夏天: "summer",
    秋天: "autumn",
    冬天: "winter",
    红色: "red",
    蓝色: "blue",
    绿色: "green",
    黄色: "yellow",
    黑色: "black",
    白色: "white",
    灰色: "gray",
    紫色: "purple",
    橙色: "orange",
    粉色: "pink",
  }

  let translatedText = text

  for (const [chinese, english] of Object.entries(commonTranslations)) {
    if (text.includes(chinese)) {
      translatedText = translatedText.replace(new RegExp(chinese, "g"), english)
    }
  }

  if (translatedText === text) {
    if (/[\u4e00-\u9fff]/.test(text)) {
      const pinyinMap: Record<string, string> = {
        商: "shang",
        业: "ye",
        会: "hui",
        议: "yi",
        自: "zi",
        然: "ran",
        风: "feng",
        景: "jing",
        科: "ke",
        技: "ji",
        美: "mei",
        食: "shi",
        运: "yun",
        动: "dong",
        城: "cheng",
        市: "shi",
        家: "jia",
        庭: "ting",
        教: "jiao",
        育: "yu",
        医: "yi",
        疗: "liao",
        旅: "lv",
        行: "xing",
      }

      let pinyinResult = ""
      for (const char of text) {
        if (pinyinMap[char]) {
          pinyinResult += pinyinMap[char] + " "
        } else if (/[\u4e00-\u9fff]/.test(char)) {
          pinyinResult += char + " "
        } else {
          pinyinResult += char
        }
      }
      translatedText = pinyinResult.trim()
    }
  }

  if (translatedText === text && /[\u4e00-\u9fff]/.test(text)) {
    translatedText = `${text} content`
  }

  return translatedText
}
