import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const baseFilename = `${timestamp}-${originalName}`;

    const uploadPath = path.join(process.cwd(), "public/uploads/news");
    await fs.mkdir(uploadPath, { recursive: true });

    // 新闻图片：保持原始比例，限制最大宽度 1600px，webp 压缩
    const filename = `${baseFilename}.webp`;
    const filePath = path.join(uploadPath, filename);

    await sharp(buffer)
      .resize({
        width: 1600,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 82, effort: 6 })
      .toFile(filePath);

    return NextResponse.json({
      url: `/uploads/news/${filename}`,
    });
  } catch (error) {
    console.error("News upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
