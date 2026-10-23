import path from "path";
import crypto from "crypto";

/**
 * 上传安全工具：统一文件名清洗 + 扩展名白名单，
 * 防止路径穿越（文件名含 ../ /）与恶意类型（.svg/.html 等）。
 */

export const ALLOWED_EXT = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  video: [".mp4", ".webm", ".ogg", ".mov", ".avi"],
  pdf: [".pdf"],
} as const;

/** 校验扩展名是否在白名单内，返回小写扩展名（含点）；不在返回 null */
export function getSafeExt(fileName: string, allowed: readonly string[]): string | null {
  const ext = path.extname(fileName || "").toLowerCase();
  return allowed.includes(ext) ? ext : null;
}

/**
 * 生成安全文件名：`时间戳-清洗后的原名-随机串<ext>`
 * - 去除路径分隔符、控制字符、非法字符，杜绝 ../ 穿越
 * - 保留可读原名（截断 80 字符），追加随机串避免撞名
 */
export function sanitizeFilename(originalName: string, ext: string): string {
  const base = (originalName || "file")
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "")
    .replace(/\.+$/, "")
    .slice(0, 80)
    .trim() || "file";
  const rand = crypto.randomBytes(4).toString("hex");
  return `${Date.now()}-${base}-${rand}${ext}`;
}
