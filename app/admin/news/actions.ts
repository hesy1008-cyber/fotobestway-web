"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNews(formData: FormData) {
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const summary = String(formData.get("summary") || "");
  const content = String(formData.get("content") || "");
  const coverImage = String(formData.get("coverImage") || "");
  const category = String(formData.get("category") || "Company News");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = formData.get("isActive") === "on";
  const seoTitle = String(formData.get("seoTitle") || "");
  const metaDescription = String(formData.get("metaDescription") || "");
  const focusKeywords = String(formData.get("focusKeywords") || "");

  if (!title || !slug) {
    throw new Error("标题和标识不能为空");
  }

  await prisma.news.create({
    data: {
      title,
      slug,
      summary: summary || null,
      content: content || null,
      coverImage: coverImage || null,
      category,
      sortOrder,
      isActive,
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      focusKeywords: focusKeywords || null,
    },
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updateNews(id: string, formData: FormData) {
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const summary = String(formData.get("summary") || "");
  const content = String(formData.get("content") || "");
  const coverImage = String(formData.get("coverImage") || "");
  const category = String(formData.get("category") || "Company News");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = formData.get("isActive") === "on";
  const seoTitle = String(formData.get("seoTitle") || "");
  const metaDescription = String(formData.get("metaDescription") || "");
  const focusKeywords = String(formData.get("focusKeywords") || "");

  if (!title || !slug) {
    throw new Error("标题和标识不能为空");
  }

  await prisma.news.update({
    where: { id },
    data: {
      title,
      slug,
      summary: summary || null,
      content: content || null,
      coverImage: coverImage || null,
      category,
      sortOrder,
      isActive,
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      focusKeywords: focusKeywords || null,
    },
  });

  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function deleteNews(id: string) {
  await prisma.news.delete({ where: { id } });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
