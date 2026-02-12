import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      "@supabase/supabase-js",
      "@supabase/ssr",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-placeholder",
    ],
  },
};

export default nextConfig;
