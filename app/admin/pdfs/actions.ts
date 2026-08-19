"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPdf(formData: FormData) {
  const title = formData.get("title") as string;
  const categoryId = formData.get("categoryId") as string;
  const fileName = formData.get("fileName") as string;
  const fileSize = parseInt(formData.get("fileSize") as string);
  const fileUrl = formData.get("fileUrl") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!title || !categoryId || !fileUrl) {
    throw new Error("Missing required fields");
  }

  await prisma.pdfFile.create({
    data: {
      title,
      categoryId,
      fileName,
      fileSize,
      fileUrl,
      sortOrder,
      isActive,
    },
  });

  revalidatePath("/admin/pdfs");
  revalidatePath("/support");
  redirect("/admin/pdfs");
}

export async function updatePdf(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const categoryId = formData.get("categoryId") as string;
  const fileName = formData.get("fileName") as string;
  const fileSize = parseInt(formData.get("fileSize") as string);
  const fileUrl = formData.get("fileUrl") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!id || !title || !categoryId || !fileUrl) {
    throw new Error("Missing required fields");
  }

  await prisma.pdfFile.update({
    where: { id },
    data: {
      title,
      categoryId,
      fileName,
      fileSize,
      fileUrl,
      sortOrder,
      isActive,
    },
  });

  revalidatePath("/admin/pdfs");
  revalidatePath("/support");
  redirect("/admin/pdfs");
}

export async function deletePdf(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Missing id");
  }

  await prisma.pdfFile.delete({
    where: { id },
  });

  revalidatePath("/admin/pdfs");
}
