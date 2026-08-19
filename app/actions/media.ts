"use server";

import { prisma } from "@/app/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// 保存文件
async function saveFile(file: File, subfolder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = Date.now() + "-" + file.name;
  const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${subfolder}/${fileName}`;
}

// ============================
// 轮播图 Banner
// ============================

export async function createBanner(formData: FormData) {
  const file = formData.get("image") as File | null;
  const title = String(formData.get("title") || "");
  const subtitle = String(formData.get("subtitle") || "");
  const buttonText = String(formData.get("buttonText") || "");
  const buttonLink = String(formData.get("buttonLink") || "");

  if (!file || file.size === 0) {
    throw new Error("请上传图片");
  }

  const image = await saveFile(file, "banners");

  // 计算 sortOrder
  const count = await prisma.banner.count();

  await prisma.banner.create({
    data: {
      image,
      title: title || null,
      subtitle: subtitle || null,
      buttonText: buttonText || null,
      buttonLink: buttonLink || null,
      sortOrder: count,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function deleteBanner(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return;

  // 删除文件
  try {
    const filePath = path.join(process.cwd(), "public", banner.image);
    await fs.unlink(filePath);
  } catch (e) {
    // ignore
  }

  await prisma.banner.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function updateBannerSort(items: { id: string; sortOrder: number }[]) {
  for (const item of items) {
    await prisma.banner.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function toggleBannerActive(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return;

  await prisma.banner.update({
    where: { id },
    data: { isActive: !banner.isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

// ============================
// 佳作欣赏 GalleryItem
// ============================

export async function createGalleryItem(formData: FormData) {
  const file = formData.get("image") as File | null;
  const title = String(formData.get("title") || "");
  const photographer = String(formData.get("photographer") || "");

  if (!file || file.size === 0) {
    throw new Error("请上传图片");
  }

  const image = await saveFile(file, "gallery");

  // 计算 sortOrder
  const count = await prisma.galleryItem.count();

  await prisma.galleryItem.create({
    data: {
      image,
      title: title || null,
      photographer: photographer || null,
      sortOrder: count,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function deleteGalleryItem(id: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;

  // 删除文件
  try {
    const filePath = path.join(process.cwd(), "public", item.image);
    await fs.unlink(filePath);
  } catch (e) {
    // ignore
  }

  await prisma.galleryItem.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function updateGallerySort(items: { id: string; sortOrder: number }[]) {
  for (const item of items) {
    await prisma.galleryItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function toggleGalleryActive(id: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;

  await prisma.galleryItem.update({
    where: { id },
    data: { isActive: !item.isActive },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}
