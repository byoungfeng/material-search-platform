#!/usr/bin/env node

const https = require("https")
const http = require("http")

// 部署检查脚本
async function checkDeployment() {
  console.log("🚀 开始部署检查...")

  const checks = [
    {
      name: "环境变量检查",
      check: () => {
        const required = ["PIXABAY_API_KEY"]
        const missing = required.filter((key) => !process.env[key])
        if (missing.length > 0) {
          throw new Error(`缺少环境变量: ${missing.join(", ")}`)
        }
        return "✅ 环境变量配置正确"
      },
    },
    {
      name: "API 连通性检查",
      check: async () => {
        try {
          const response = await fetch("https://pixabay.com/api/?key=test&q=test&per_page=3")
          if (response.status === 400) {
            return "✅ Pixabay API 可访问"
          }
          throw new Error("API 响应异常")
        } catch (error) {
          throw new Error(`API 连接失败: ${error.message}`)
        }
      },
    },
    {
      name: "翻译服务检查",
      check: async () => {
        try {
          // 检查 Google 翻译
          const response = await fetch(
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=en&dt=t&q=测试",
          )
          if (response.ok) {
            return "✅ 翻译服务可用"
          }
          return "⚠️ 翻译服务可能不稳定"
        } catch (error) {
          return "⚠️ 翻译服务连接失败，将使用本地翻译"
        }
      },
    },
  ]

  for (const { name, check } of checks) {
    try {
      console.log(`\n📋 ${name}...`)
      const result = await check()
      console.log(`   ${result}`)
    } catch (error) {
      console.log(`   ❌ ${error.message}`)
      if (name === "环境变量检查") {
        console.log("   💡 请在 Vercel 项目设置中配置环境变量")
        process.exit(1)
      }
    }
  }

  console.log("\n🎉 部署检查完成！")
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDeployment().catch((error) => {
    console.error("❌ 部署检查失败:", error)
    process.exit(1)
  })
}

module.exports = { checkDeployment }
