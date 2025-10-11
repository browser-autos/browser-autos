import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
