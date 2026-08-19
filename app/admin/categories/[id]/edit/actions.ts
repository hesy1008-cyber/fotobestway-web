"use server"

import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"

export async function updateCategory(
  formData: FormData
) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const bannerImage = formData.get("bannerImage") as string
  const bannerTitle = formData.get("bannerTitle") as string
  const bannerDescription = formData.get("bannerDescription") as string

  await prisma.category.update({
    where: {
      id
    },
    data: {
      name,
      bannerImage: bannerImage || null,
      bannerTitle: bannerTitle || null,
      bannerDescription: bannerDescription || null,
    }
  })

  redirect("/admin/categories")
}
