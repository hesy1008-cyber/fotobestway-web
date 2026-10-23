import type { NextConfig } from "next";

// COS 对象存储域名（构建时从 env 读取；未配置 COS 则空数组，不限制任何域名）
const cosHost =
  process.env.COS_BUCKET && process.env.COS_REGION
    ? `${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com`
    : null;

const nextConfig: NextConfig = {

  allowedDevOrigins: [
    '192.168.10.108:3000',
    '192.168.10.108',
  ],

  // next/image 允许优化外部域名（COS 存储桶）
  images: {
    remotePatterns: cosHost
      ? [{ protocol: "https", hostname: cosHost }]
      : [],
  },

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

  // 忽略 uploads 上传代码里 path.join(process.cwd(),"public/uploads") 的
  // "Overly broad patterns" 静态分析警告（运行时动态路径，构建期扫描 public/uploads 无意义）
  turbopack: {
    ignoreIssue: [
      { path: /app[\\/]actions[\\/](about|media)\.ts/ },
      { path: /app[\\/]api[\\/]uploads/ },
    ],
  },

};


export default nextConfig;