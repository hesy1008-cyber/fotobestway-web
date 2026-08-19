import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const shortDescription = String(formData.get("shortDescription") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const subCategoryId = String(formData.get("subCategoryId") || "") || null;
  const overview = String(formData.get("overview") || "");
  let video = String(formData.get("video") || "");

  // SEO 字段
  const seoTitle = String(formData.get("seoTitle") || "") || null;
  const metaDescription = String(formData.get("metaDescription") || "") || null;
  const focusKeywords = String(formData.get("focusKeywords") || "") || null;
  const hiddenSeoText = String(formData.get("hiddenSeoText") || "") || null;
  const imageAlt = String(formData.get("imageAlt") || "") || null;

  // 视频文件上传
  const videoFile = formData.get("videoFile") as File | null;
  if (videoFile && videoFile.size > 0) {
    console.log("Uploading video file:", videoFile.name, "size:", videoFile.size);

    const ext = path.extname(videoFile.name).toLowerCase();
    const allowedExts = [".mp4", ".webm", ".ogg", ".mov", ".avi"];

    if (allowedExts.includes(ext)) {
      const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
      const timestamp = Date.now();
      const filename = `${timestamp}-${originalName}${ext}`;

      const videoUploadDir = path.join(process.cwd(), "public/uploads/videos");
      await fs.mkdir(videoUploadDir, { recursive: true });

      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(path.join(videoUploadDir, filename), buffer);

      video = `/uploads/videos/${filename}`;
      console.log("Video uploaded successfully:", video);
    }
  }

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category required" },
      { status: 400 }
    );
  }

  /*
  =====================
  图片上传
  =====================
  */

  const uploadDir = path.join(process.cwd(), "public/uploads/products");

  await fs.mkdir(uploadDir, { recursive: true });

  const imageFile = formData.get("image") as File | null;

  let imagePath = "/uploads/products/default.webp";

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = imageFile.name.replace(/\s+/g, "-");
    const fileName = Date.now() + "-" + safeName;

    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    imagePath = "/uploads/products/" + fileName;
  }

  /*
  =====================
  Gallery 图片
  =====================
  */

  const galleryFiles = formData.getAll("gallery") as File[];

  const gallery: string[] = [];

  for (const file of galleryFiles) {
    if (!file || file.size === 0) {
      continue;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = Date.now() + "-gallery-" + safeName;

    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    gallery.push("/uploads/products/" + fileName);
  }

  /*
  =====================
  详情图片
  =====================
  */

  const detailFiles = formData.getAll("detailImages") as File[];

  const detailImages: string[] = [];

  for (const file of detailFiles) {
    if (!file || file.size === 0) {
      continue;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = Date.now() + "-detail-" + safeName;

    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    detailImages.push("/uploads/products/" + fileName);
  }

  /*
  =====================
  文本数据
  =====================
  */

  const features = String(formData.get("features") || "")
    .split("\n")
    .filter(Boolean);

  const applications = String(formData.get("applications") || "")
    .split("\n")
    .filter(Boolean);

  const specsText = String(formData.get("specs") || "");

  const specs = Object.fromEntries(
    specsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf(":");

        if (index === -1) {
          return [item.trim(), ""];
        }

        return [item.slice(0, index).trim(), item.slice(index + 1).trim()];
      })
      .filter(([key]) => key)
  );

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      categoryId,
      subCategoryId,
      image: imagePath,
      shortDescription,
      detailImages,
      gallery,
      overview,
      features,
      applications,
      specs,
      video,
      seoTitle,
      metaDescription,
      focusKeywords,
      hiddenSeoText,
      imageAlt,
    },
  });

  return NextResponse.json(product);
}
