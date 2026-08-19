import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成基础文件名（不带扩展名）
    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();
    const baseFilename = `${timestamp}-${originalName}`;

    const uploadPath = path.join(process.cwd(), "public/uploads/products");
    await fs.mkdir(uploadPath, { recursive: true });

    // 生成三个尺寸的 WebP 图片
    const sizes = [
      { suffix: "-thumb", width: 400, height: 400, quality: 80 },
      { suffix: "-medium", width: 800, height: 800, quality: 82 },
      { suffix: "", width: 1500, height: 1500, quality: 85 }, // 主图（大图）
    ];

    for (const size of sizes) {
      const filename = `${baseFilename}${size.suffix}.webp`;
      const filePath = path.join(uploadPath, filename);

      await sharp(buffer)
        .resize({
          width: size.width,
          height: size.height,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: size.quality,
          effort: 6,
        })
        .toFile(filePath);
    }

    // 返回主图 URL（大图版本）
    return NextResponse.json({
      url: `/uploads/products/${baseFilename}.webp`,
      thumbUrl: `/uploads/products/${baseFilename}-thumb.webp`,
      mediumUrl: `/uploads/products/${baseFilename}-medium.webp`,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}
