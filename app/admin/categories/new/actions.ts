"use server"

import { prisma } from "@/app/lib/prisma"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createCategory(
  formData: FormData
) {
  const name = formData.get("name") as string
  const bannerImage = formData.get("bannerImage") as string
  const bannerTitle = formData.get("bannerTitle") as string
  const bannerDescription = formData.get("bannerDescription") as string

  if (!name) {
    return {
      success: false,
      message: "分类名称为必填项"
    }
  }

  const slug = generateSlug(name);

  const exists = await prisma.category.findUnique({
    where: {
      slug
    }
  })

  if (exists) {
    return {
      success: false,
      message: "分类名称已存在（自动生成的别名重复）"
    }
  }

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        bannerImage: bannerImage || null,
        bannerTitle: bannerTitle || null,
        bannerDescription: bannerDescription || null,
      }
    })

    return {
      success: true,
      message: "分类创建成功"
    }
  } catch (error) {
    console.error("Create category failed:", error)
    return {
      success: false,
      message: "创建分类失败"
    }
  }
}
