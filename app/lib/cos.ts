import fs from "fs";
import path from "path";

/**
 * 腾讯云 COS 视频存储。
 *
 * 通过环境变量配置（未配置时返回 null，调用方回退到本地 public/uploads 保存）：
 * - COS_REGION      地域，如 ap-shanghai
 * - COS_BUCKET      存储桶名，如 fotobestway-video
 * - COS_SECRET_ID   腾讯云 API 密钥
 * - COS_SECRET_KEY  腾讯云 API 密钥
 */

let cosClient: any = null;

function getCosClient() {
  if (cosClient) return cosClient;
  const region = process.env.COS_REGION;
  const bucket = process.env.COS_BUCKET;
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  if (!region || !bucket || !secretId || !secretKey) return null;
  try {
    // 动态 require，避免未配置时引入构建问题
    const COS = require("cos-nodejs-sdk-v5");
    cosClient = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    });
    return cosClient;
  } catch (e) {
    console.error("[cos] SDK init failed:", e);
    return null;
  }
}

export function isCosConfigured(): boolean {
  return !!getCosClient();
}

/** 把本地文件上传到 COS，返回公网可访问的 URL；失败抛错 */
export function uploadToCos(
  localPath: string,
  cosKey: string
): Promise<string> {
  const client = getCosClient();
  const region = process.env.COS_REGION!;
  const bucket = process.env.COS_BUCKET!;
  if (!client) {
    throw new Error("COS not configured");
  }
  return new Promise((resolve, reject) => {
    client.uploadFile(
      {
        Bucket: bucket,
        Region: region,
        Key: cosKey,
        FilePath: localPath,
        ContentType: getContentType(cosKey),
      },
      (err: any, data: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(
          `https://${bucket}.cos.${region}.myqcloud.com/${encodeCosKey(cosKey)}`
        );
      }
    );
  });
}

function getContentType(key: string): string {
  const ext = path.extname(key).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

function encodeCosKey(key: string): string {
  // COS Key 允许中文等字符，URL 中需要 encode，但保留 /
  return key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}
