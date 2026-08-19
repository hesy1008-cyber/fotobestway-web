import type { NextConfig } from "next";


const nextConfig: NextConfig = {

  allowedDevOrigins: [
    '192.168.10.108:3000',
    '192.168.10.108',
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
    // 客户端请求体大小限制（默认 10MB，调大到 500MB）
    proxyClientMaxBodySize: "500mb",
  },

  // 把 uploads 请求重写到 API 路由，确保新上传的文件立即可用
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },

};


export default nextConfig;