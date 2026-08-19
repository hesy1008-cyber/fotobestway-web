"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

// 创建二级分类
export async function createSubCategory(formData: FormData) {
  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name || !slug || !categoryId) {
    throw new Error("Name, slug and categoryId are required");
  }

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
  const slug = String(formData.get("slug") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const categoryId = String(formData.get("categoryId") || "");

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  await prisma.subCategory.update({
    where: { id },
    data: {
      name,
      slug,
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
