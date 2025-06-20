import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "素材搜索平台 - 免费视频图片音乐素材",
  description: "中文搜索高质量免费视频、图片、音乐素材，支持智能翻译，来源于Pixabay等优质平台",
  keywords: "视频素材,图片素材,音乐素材,免费素材,Pixabay,中文搜索",
  authors: [{ name: "素材搜索平台" }],
  openGraph: {
    title: "素材搜索平台",
    description: "中文搜索高质量免费素材",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
