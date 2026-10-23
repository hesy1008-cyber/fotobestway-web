import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAdminRole } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成文件名：时间戳 + 原始文件名
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;

    const uploadPath = path.join(process.cwd(), "public/uploads/pdfs");
    await fs.mkdir(uploadPath, { recursive: true });

    const filePath = path.join(uploadPath, filename);
    await fs.writeFile(filePath, buffer);

    // 返回文件信息
    return NextResponse.json({
      url: `/uploads/pdfs/${filename}`,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("[upload-pdf] error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
