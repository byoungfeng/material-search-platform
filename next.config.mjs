/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,
  swcMinify: true,
  
  // 图片优化配置
  images: {
    domains: [
      'images.unsplash.com',
      'pixabay.com',
      'cdn.pixabay.com',
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 环境变量配置
  env: {
    PIXABAY_API_KEY: process.env.PIXABAY_API_KEY,
  },

  // 输出配置 - 移除 standalone 以兼容 Netlify
  // output: 'standalone',
  
  // 压缩配置
  compress: true,
  
  // 电源配置
  poweredByHeader: false,

  // ESLint 配置 - 构建时忽略错误
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript 配置 - 构建时忽略错误
  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 忽略某些警告
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },

  // 实验性功能
  experimental: {
    // 移除可能导致问题的实验性功能
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
