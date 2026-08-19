import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParams } = await params;
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      ...pathParams
    );

    // 安全检查：防止路径遍历
    const publicDir = path.join(process.cwd(), "public", "uploads");
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // 检查文件是否存在
    const stat = fs.statSync(resolvedPath);
    const fileSize = stat.size;

    // 根据扩展名设置 Content-Type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".pdf": "application/pdf",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // 处理 Range 请求（视频播放必需）
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(resolvedPath, { start, end });

      return new NextResponse(fileStream as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": chunkSize.toString(),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 普通请求：流式返回整个文件
    const fileStream = fs.createReadStream(resolvedPath);

    return new NextResponse(fileStream as unknown as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
