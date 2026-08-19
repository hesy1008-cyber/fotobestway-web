"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPdfCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const subtitle = formData.get("subtitle") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!name || !slug) {
    throw new Error("名称和标识不能为空");
  }

  await prisma.pdfCategory.create({
    data: {
      name,
      slug,
      subtitle: subtitle || null,
      description: description || null,
      icon: icon || null,
      sortOrder,
    },
  });

  revalidatePath("/admin/pdf-categories");
  revalidatePath("/admin/pdfs");
  revalidatePath("/support");
  redirect("/admin/pdf-categories");
}

export async function updatePdfCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const subtitle = formData.get("subtitle") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!id || !name || !slug) {
    throw new Error("ID、名称和标识不能为空");
  }

  await prisma.pdfCategory.update({
    where: { id },
    data: {
      name,
      slug,
      subtitle: subtitle || null,
      description: description || null,
      icon: icon || null,
      sortOrder,
      isActive,
    },
  });

  revalidatePath("/admin/pdf-categories");
  revalidatePath("/admin/pdfs");
  revalidatePath("/support");
  redirect("/admin/pdf-categories");
}

export async function deletePdfCategory(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("ID 不能为空");
  }

  // 检查是否还有文件
  const count = await prisma.pdfFile.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    throw new Error(`该分类下还有 ${count} 个文件，请先移动或删除这些文件`);
  }

  await prisma.pdfCategory.delete({
    where: { id },
  });

  revalidatePath("/admin/pdf-categories");
  revalidatePath("/admin/pdfs");
  revalidatePath("/support");
  redirect("/admin/pdf-categories");
}
