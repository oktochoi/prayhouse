import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" 제거 - Supabase OAuth 콜백 등 서버 라우트 사용을 위해 필요
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
