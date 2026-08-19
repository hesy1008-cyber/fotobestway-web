import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Busboy from "busboy";
import { Readable } from "stream";

// 使用 Node.js runtime，支持大文件上传
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 最长上传时间 5 分钟

export async function POST(req: Request): Promise<Response> {
  try {
    console.log("Video upload request received");

    const contentType = req.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    // 读取请求体
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Total request size:", buffer.length, "bytes");

    return new Promise<Response>((resolve) => {
      const busboy = Busboy({
        headers: {
          "content-type": contentType,
        },
        limits: {
          fileSize: 500 * 1024 * 1024, // 500MB
        },
      });

      let uploadedFile: { filename: string; mimeType: string; size: number } | null = null;

      const uploadPath = path.join(process.cwd(), "public/uploads/videos");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      busboy.on("file", (fieldname, file, info) => {
        const { filename, mimeType } = info;
        console.log("File received:", filename, "type:", mimeType);

        // 检查文件类型
        const ext = path.extname(filename).toLowerCase();
        const allowedTypes = [
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/quicktime",
          "video/x-msvideo",
        ];
        const allowedExts = [".mp4", ".webm", ".ogg", ".mov", ".avi"];

        const isAllowedType = allowedTypes.includes(mimeType) || allowedExts.includes(ext);

        if (!isAllowedType) {
          console.log("Unsupported file type:", mimeType);
          file.resume(); // 丢弃数据
          return;
        }

        // 生成文件名
        const originalName = filename.replace(/\.[^/.]+$/, "");
        const timestamp = Date.now();
        const saveFilename = `${timestamp}-${originalName}${ext}`;
        const savePath = path.join(uploadPath, saveFilename);

        console.log("Saving to:", savePath);

        const writeStream = fs.createWriteStream(savePath);
        let fileSize = 0;

        file.on("data", (data) => {
          fileSize += data.length;
        });

        file.pipe(writeStream);

        writeStream.on("finish", () => {
          console.log("File saved:", saveFilename, "size:", fileSize);
          uploadedFile = {
            filename: saveFilename,
            mimeType,
            size: fileSize,
          };
        });

        writeStream.on("error", (err) => {
          console.error("Write stream error:", err);
        });
      });

      busboy.on("finish", () => {
        console.log("Busboy finished");

        if (!uploadedFile) {
          resolve(
            NextResponse.json(
              { error: "No file uploaded or unsupported format" },
              { status: 400 }
            )
          );
          return;
        }

        resolve(
          NextResponse.json({
            url: `/uploads/videos/${uploadedFile.filename}`,
            name: uploadedFile.filename,
            size: uploadedFile.size,
          })
        );
      });

      busboy.on("error", (err: Error) => {
        console.error("Busboy error:", err);
        resolve(
          NextResponse.json(
            { error: "Upload failed: " + err.message },
            { status: 500 }
          )
        );
      });

      // 将 buffer 转换成 Node.js 流，再传给 busboy
      Readable.from(buffer).pipe(busboy);
    });
  } catch (error: any) {
    console.error("Video upload error:", error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);

    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
