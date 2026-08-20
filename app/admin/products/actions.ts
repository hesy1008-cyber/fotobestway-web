"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

// 创建产品
export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const image = String(formData.get("image") || "");
  const overview = String(formData.get("overview") || "");

  const category = String(formData.get("category") || "");
  const categoryRecord = category
    ? await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      })
    : null;

  const features = String(formData.get("features") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const applications = String(formData.get("applications") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // 优先读取多型号格式 specsJson
  const specsJsonStr = String(formData.get("specsJson") || "");
  let specs: any;
  if (specsJsonStr) {
    try {
      const parsed = JSON.parse(specsJsonStr);
      specs = parsed
        .filter((m: any) => m.specs && m.specs.length > 0)
        .map((m: any) => ({
          model: m.model || "",
          specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
        }));
    } catch (e) {
      specs = [];
    }
  } else {
    specs = String(formData.get("specs") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          return {
            label: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          };
        }
        return { label: line, value: "" };
      });
  }

  await prisma.product.create({
    data: {
      title,
      slug,
      image,
      overview,
      categoryId: categoryRecord?.id,
      features,
      applications,
      specs,
    },
  });

  redirect("/admin/products");
}

// 删除产品
export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  redirect("/admin/products");
}

// 更新产品
export async function updateProduct(id: string, formData: FormData) {
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const shortDescription = String(formData.get("shortDescription") || "");
  const overview = String(formData.get("overview") || "");
  const categoryId = String(formData.get("categoryId") || "") || null;
  const subCategoryId = String(formData.get("subCategoryId") || "") || null;

  const features = String(formData.get("features") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const applications = String(formData.get("applications") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // 优先读取多型号格式 specsJson
  const specsJsonStr = String(formData.get("specsJson") || "");
  let specs: any;
  if (specsJsonStr) {
    try {
      const parsed = JSON.parse(specsJsonStr);
      specs = parsed
        .filter((m: any) => m.specs && m.specs.length > 0)
        .map((m: any) => ({
          model: m.model || "",
          specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
        }));
    } catch (e) {
      specs = [];
    }
  } else {
    specs = String(formData.get("specs") || "")
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          return {
            label: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          };
        }
        return { label: line, value: "" };
      });
  }

  // 图片和图集
  const image = String(formData.get("image") || "");
  let gallery: any = undefined;
  const galleryOrderStr = String(formData.get("galleryOrder") || "");
  if (galleryOrderStr) {
    try {
      gallery = JSON.parse(galleryOrderStr);
    } catch (e) {
      gallery = undefined;
    }
  }
  let detailImages: any = undefined;
  const detailImagesStr = String(formData.get("detailImages") || "");
  if (detailImagesStr) {
    try {
      detailImages = JSON.parse(detailImagesStr);
    } catch (e) {
      detailImages = undefined;
    }
  }

  // 视频
  const video = String(formData.get("video") || "") || null;

  // SEO 字段
  const seoTitle = String(formData.get("seoTitle") || "") || null;
  const metaDescription = String(formData.get("metaDescription") || "") || null;
  const focusKeywords = String(formData.get("focusKeywords") || "") || null;
  const imageAlt = String(formData.get("imageAlt") || "") || null;
  const hiddenSeoText = String(formData.get("hiddenSeoText") || "") || null;

  // 构建更新数据
  const updateData: any = {
    title,
    slug,
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
    imageAlt,
    hiddenSeoText,
  };

  // 只有上传了新图片才更新
  if (image) updateData.image = image;
  if (gallery !== undefined) updateData.gallery = gallery;
  if (detailImages !== undefined) updateData.detailImages = detailImages;

  await prisma.product.update({
    where: { id },
    data: updateData,
  });

  redirect("/admin/products");
}
