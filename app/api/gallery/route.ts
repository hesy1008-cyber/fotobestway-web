import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const title = String(formData.get("title") || "");
    const photographer = String(formData.get("photographer") || "");

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "请上传图片" },
        { status: 400 }
      );
    }

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = Date.now() + "-" + file.name;
    const uploadDir = path.join(process.cwd(), "public/uploads/gallery");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    const image = `/uploads/gallery/${fileName}`;

    // 计算 sortOrder
    const count = await prisma.galleryItem.count();

    // 创建数据库记录
    const newItem = await prisma.galleryItem.create({
      data: {
        image,
        title: title || null,
        photographer: photographer || null,
        sortOrder: count,
      },
    });

    // 重新验证首页和媒体管理页面
    revalidatePath("/");
    revalidatePath("/admin/media");

    return NextResponse.json({
      success: true,
      id: newItem.id,
      image: newItem.image,
      title: newItem.title,
      photographer: newItem.photographer,
      sortOrder: newItem.sortOrder,
      isActive: newItem.isActive,
    });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: "上传失败" },
      { status: 500 }
    );
  }
}
