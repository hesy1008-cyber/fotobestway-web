"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// 创建二级分类
export async function createSubCategory(formData: FormData) {
  const name = String(formData.get("name") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name || !categoryId) {
    throw new Error("Name and categoryId are required");
  }

  const slug = generateSlug(name);

  await prisma.subCategory.create({
    data: {
      name,
      slug,
      categoryId,
      sortOrder,
    },
  });

  redirect(`/admin/categories/${categoryId}/sub-categories`);
}

// 更新二级分类
export async function updateSubCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const categoryId = String(formData.get("categoryId") || "");

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.subCategory.update({
    where: { id },
    data: {
      name,
      sortOrder,
    },
  });

  redirect(`/admin/categories/${categoryId}/sub-categories`);
}

// 删除二级分类
export async function deleteSubCategory(formData: FormData) {
  const id = String(formData.get("id") || "");
  const categoryId = String(formData.get("categoryId") || "");

  await prisma.subCategory.delete({
    where: { id },
  });

  redirect(`/admin/categories/${categoryId}/sub-categories`);
}
