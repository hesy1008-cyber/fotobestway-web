"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

// ============================
// 保存单张图片
// ============================

async function saveFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = Date.now() + "-" + file.name;

  const uploadDir = path.join(process.cwd(), "public/uploads");

  await fs.mkdir(uploadDir, { recursive: true });

  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return "/uploads/" + fileName;
}

// ============================
// 保存多张图片
// ============================

async function saveMultipleFiles(files: File[]) {
  const result: string[] = [];

  for (const file of files) {
    if (file.size > 0) {
      const url = await saveFile(file);
      result.push(url);
    }
  }

  return result;
}

// ============================
// 更新产品
// ============================

export async function updateProduct(id: string, formData: FormData) {
  console.log("FORM DATA KEYS:", Array.from(formData.keys()));

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const shortDescription = String(formData.get("shortDescription") || "");
  const overview = String(formData.get("overview") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const subCategoryId = String(formData.get("subCategoryId") || "") || null;
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

      const uploadDir = path.join(process.cwd(), "public/uploads/videos");
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(path.join(uploadDir, filename), buffer);

      video = `/uploads/videos/${filename}`;
      console.log("Video uploaded successfully:", video);
    }
  }

  // ============================
  // 图片处理
  // ============================

  const oldProduct = await prisma.product.findUnique({
    where: { id },
  });

  let image = oldProduct?.image || "";

  // 主图
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    image = await saveFile(imageFile);
  }

  // 顶部轮播
  let gallery: string[] = Array.isArray(oldProduct?.gallery)
    ? (oldProduct.gallery as string[])
    : [];

  const galleryOrderText = String(formData.get("galleryOrder") || "");

  if (galleryOrderText) {
    gallery = JSON.parse(galleryOrderText) as string[];
  }

  const galleryFiles = formData
    .getAll("gallery")
    .filter((file) => file instanceof File && file.size > 0) as File[];

  console.log("GALLERY FILES:", galleryFiles.map((f) => f.name));

  if (galleryFiles.length > 0) {
    const newGallery = await saveMultipleFiles(galleryFiles);
    gallery = [...gallery, ...newGallery];
  }

  // 详情切片
  let detailImages: string[] = Array.isArray(oldProduct?.detailImages)
    ? (oldProduct.detailImages as string[])
    : [];

  // 从前端获取删除后的列表
  const detailImagesText = String(formData.get("detailImages") || "");
  if (detailImagesText) {
    try {
      detailImages = JSON.parse(detailImagesText);
    } catch (e) {
      console.error("Parse detailImages failed:", e);
    }
  }

  const detailFiles = formData
    .getAll("detailImagesNew")
    .filter((file) => file instanceof File && file.size > 0) as File[];

  if (detailFiles.length > 0) {
    const newDetailImages = await saveMultipleFiles(detailFiles);
    detailImages = [...detailImages, ...newDetailImages];
  }

  // ============================
  // 文本
  // ============================

  const features = String(formData.get("features") || "")
    .split("\n")
    .filter(Boolean);

  const applications = String(formData.get("applications") || "")
    .split("\n")
    .filter(Boolean);

  // 优先读取多型号格式 specsJson
  const specsJsonStr = String(formData.get("specsJson") || "");
  console.log("SPECS_JSON_VALUE:", JSON.stringify(specsJsonStr));
  console.log("SPECS_JSON_LENGTH:", specsJsonStr.length);
  let specs: any;
  if (specsJsonStr) {
    try {
      const parsed = JSON.parse(specsJsonStr);
      // 过滤掉空型号和空规格
      specs = parsed
        .filter((m: any) => m.specs && m.specs.length > 0)
        .map((m: any) => ({
          model: m.model || "",
          specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
        }));
    } catch (e) {
      console.error("Parse specsJson failed:", e);
      specs = {};
    }
  } else {
    // 旧格式兼容
    const specsText = String(formData.get("specs") || "");
    specs = Object.fromEntries(
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
  }

  try {
    console.log("Saving product with video:", video);
    await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        image,
        gallery,
        detailImages,
        shortDescription,
        overview,
        categoryId,
        subCategoryId,
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
    console.log("Product saved successfully, video field updated");
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    throw error;
  }

  redirect("/admin/products");
}

// ============================
// 删除轮播图
// ============================

export async function removeGalleryImage(id: string, image: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const oldGallery = Array.isArray(product.gallery)
    ? (product.gallery as string[])
    : [];

  const newGallery = oldGallery.filter((item) => item !== image);

  // 删除真实文件
  try {
    const filePath = path.join(process.cwd(), "public", image);
    await fs.unlink(filePath);
    console.log("DELETE FILE:", filePath);
  } catch (error) {
    console.log("FILE DELETE FAILED:", error);
  }

  // 更新数据库
  await prisma.product.update({
    where: { id },
    data: {
      gallery: newGallery,
    },
  });
}

// ============================
// 删除产品
// ============================

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") || "");

  await prisma.product.delete({
    where: { id },
  });

  redirect("/admin/products");
}
