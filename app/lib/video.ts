import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

/**
 * 用 ffmpeg 把视频压缩到网页播放友好大小：
 * - 分辨率限制 1280px 宽（竖屏则按高度等比缩放）
 * - H.264 + AAC，CRF 27，码率上限 2Mbps
 * - faststart 保证浏览器边下边播
 *
 * 成功返回压缩后文件路径；失败（无 ffmpeg / 压缩出错 / 压缩后没变小）返回 null，原文件保留。
 */
export async function compressVideoIfPossible(
  srcPath: string
): Promise<string | null> {
  const ext = path.extname(srcPath).toLowerCase();
  if (![".mp4", ".mov", ".avi", ".webm", ".ogg", ".mkv"].includes(ext)) {
    return null;
  }

  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, ext);
  const outPath = path.join(dir, `${base}-compressed.mp4`);

  // 1. 探测 ffmpeg 是否可用
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 15000 });
  } catch {
    console.warn("[video] ffmpeg not available, skip compression");
    return null;
  }

  // 2. 压缩
  try {
    await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        srcPath,
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "27",
        "-maxrate",
        "2M",
        "-bufsize",
        "4M",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        outPath,
      ],
      { timeout: 300000 } // 最长 5 分钟
    );

    // 3. 压缩后没变小则丢弃压缩版
    const srcSize = fs.statSync(srcPath).size;
    const outSize = fs.statSync(outPath).size;
    if (outSize >= srcSize) {
      fs.unlinkSync(outPath);
      return null;
    }
    return outPath;
  } catch (e: any) {
    console.error("[video] compression failed:", e?.message || e);
    try {
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch {}
    return null;
  }
}
