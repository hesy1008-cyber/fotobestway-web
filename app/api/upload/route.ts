import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireAdminRole } from "@/app/lib/auth";
import { ALLOWED_EXT, getSafeExt } from "@/app/lib/upload-security";

// 主图上传：只允许图片，单文件上限 20MB（防内存拖垮）
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

    // 类型白名单（防 .svg/.html 等恶意文件）
    const ext = getSafeExt(file.name, ALLOWED_EXT.image);
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type, only jpg/png/webp/gif allowed" },
        { status: 400 }
      );
    }

    // 大小限制
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "File too large, max 20MB" },
        { status: 400 }
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

    // 1. JPG 源文件（后台下载/查看用 JPG，前端 next/image 会自动转 WebP 显示）
    const jpgFilename = `${baseFilename}.jpg`;
    await sharp(buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(path.join(uploadPath, jpgFilename));

    // 2. 缩略 WebP（后台列表/小图场景直接用，体积小）
    const thumbFilename = `${baseFilename}-thumb.webp`;
    await sharp(buffer)
      .resize({
        width: 400,
        height: 400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        effort: 6,
      })
      .toFile(path.join(uploadPath, thumbFilename));

    // 返回主图 URL（JPG 源）
    return NextResponse.json({
      url: `/uploads/products/${jpgFilename}`,
      thumbUrl: `/uploads/products/${thumbFilename}`,
      mediumUrl: `/uploads/products/${jpgFilename}`,
    });
  } catch (error) {
    console.error("[upload] error:", error);

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
