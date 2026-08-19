"use server";

import { prisma } from "@/app/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// 保存文件
async function saveFile(file: File, subfolder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 提取文件扩展名
  const ext = path.extname(file.name) || ".jpg";
  // 生成安全的文件名（时间戳 + 随机字符串）
  const randomStr = Math.random().toString(36).substring(2, 10);
  const fileName = `${Date.now()}-${randomStr}${ext}`;

  const uploadDir = path.join(process.cwd(), "public/uploads", subfolder);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${subfolder}/${fileName}`;
}

// 获取 About 页面数据（单例模式）
export async function getAboutPage() {
  let about = await prisma.aboutPage.findFirst();

  if (!about) {
    // 如果不存在，创建默认数据
    about = await prisma.aboutPage.create({
      data: {
        heroTitle: "OUR COMPANY",
        heroSubtitle: "Professional Photographic Equipment Solutions",
        heroButtonText: "LEARN MORE",
        heroImage: "/about/hero.jpg",
        introTitle: "Company Profile",
        introContent: "",
        factoryTitle: "Production Workshop",
        factoryImages: ["/studio.jpg", "/studio2.jpg", "/studio3.jpg"],
        certificates: [],
        videoTitle: "Take a Tour",
        videoUrl: null,
        videoPoster: null,
      },
    });
  }

  return about;
}

// 更新 About 页面基本信息
export async function updateAboutPage(formData: FormData) {
  const about = await getAboutPage();

  const heroTitle = String(formData.get("heroTitle") || "");
  const heroSubtitle = String(formData.get("heroSubtitle") || "");
  const heroButtonText = String(formData.get("heroButtonText") || "");

  const introTitle = String(formData.get("introTitle") || "");
  const introContent = String(formData.get("introContent") || "");

  const factoryTitle = String(formData.get("factoryTitle") || "");
  const videoTitle = String(formData.get("videoTitle") || "");
  let videoUrl = String(formData.get("videoUrl") || "") || null;

  // 处理 Hero 图片上传
  let heroImage = undefined;
  const heroImageFile = formData.get("heroImage") as File | null;
  if (heroImageFile && heroImageFile.size > 0) {
    heroImage = await saveFile(heroImageFile, "about");
  }

  // 处理视频文件上传
  const videoFile = formData.get("videoFile") as File | null;
  if (videoFile && videoFile.size > 0) {
    videoUrl = await saveFile(videoFile, "about/videos");
  }

  // 处理视频封面上传
  let videoPoster = undefined;
  const videoPosterFile = formData.get("videoPoster") as File | null;
  if (videoPosterFile && videoPosterFile.size > 0) {
    videoPoster = await saveFile(videoPosterFile, "about");
  }

  // 解析证书图片（已上传的图片 URL 列表）
  const certificatesStr = String(formData.get("certificates") || "");
  let certificates = undefined;
  if (certificatesStr) {
    try {
      certificates = JSON.parse(certificatesStr);
    } catch (e) {
      // ignore
    }
  }

  // 解析工厂图片（已上传的图片 URL 列表）
  const factoryImagesStr = String(formData.get("factoryImages") || "");
  let factoryImages = undefined;
  if (factoryImagesStr) {
    try {
      factoryImages = JSON.parse(factoryImagesStr);
    } catch (e) {
      // ignore
    }
  }

  await prisma.aboutPage.update({
    where: { id: about.id },
    data: {
      heroTitle: heroTitle || undefined,
      heroSubtitle: heroSubtitle || undefined,
      heroButtonText: heroButtonText || undefined,
      heroImage: heroImage,
      introTitle: introTitle || undefined,
      introContent: introContent || undefined,
      factoryTitle: factoryTitle || undefined,
      factoryImages: factoryImages,
      certificates: certificates.length > 0 ? certificates : undefined,
      videoTitle: videoTitle || undefined,
      videoUrl: videoUrl,
      videoPoster: videoPoster,
    },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
}

// 添加工厂图片
export async function addFactoryImage(formData: FormData) {
  const about = await getAboutPage();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("请上传图片");
  }

  const imageUrl = await saveFile(file, "about/factory");

  const currentImages = Array.isArray(about.factoryImages)
    ? (about.factoryImages as string[])
    : [];

  const newImages = [...currentImages, imageUrl];

  await prisma.aboutPage.update({
    where: { id: about.id },
    data: { factoryImages: newImages },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");

  return { success: true, url: imageUrl };
}

// 删除工厂图片
export async function removeFactoryImage(imageUrl: string) {
  const about = await getAboutPage();

  const currentImages = Array.isArray(about.factoryImages)
    ? (about.factoryImages as string[])
    : [];

  const newImages = currentImages.filter((img) => img !== imageUrl);

  // 只删除用户上传的文件（/uploads/ 开头），不删除静态文件
  if (imageUrl.startsWith("/uploads/")) {
    try {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      await fs.unlink(filePath);
    } catch (e) {
      // ignore
    }
  }

  await prisma.aboutPage.update({
    where: { id: about.id },
    data: { factoryImages: newImages },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
}

// 添加证书图片
export async function addCertificateImage(formData: FormData) {
  const about = await getAboutPage();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("请上传图片");
  }

  const imageUrl = await saveFile(file, "about/certificates");

  const currentCerts = Array.isArray(about.certificates)
    ? (about.certificates as string[])
    : [];

  const newCerts = [...currentCerts, imageUrl];

  await prisma.aboutPage.update({
    where: { id: about.id },
    data: { certificates: newCerts },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");

  return { success: true, url: imageUrl };
}

// 删除证书图片
export async function removeCertificateImage(imageUrl: string) {
  const about = await getAboutPage();

  const currentCerts = Array.isArray(about.certificates)
    ? (about.certificates as string[])
    : [];

  const newCerts = currentCerts.filter((img) => img !== imageUrl);

  // 只删除用户上传的文件（/uploads/ 开头），不删除静态文件
  if (imageUrl.startsWith("/uploads/")) {
    try {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      await fs.unlink(filePath);
    } catch (e) {
      // ignore
    }
  }

  await prisma.aboutPage.update({
    where: { id: about.id },
    data: { certificates: newCerts },
  });

  revalidatePath("/about");
  revalidatePath("/admin/about");
}
