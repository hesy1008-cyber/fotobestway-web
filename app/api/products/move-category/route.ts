import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 强制动态渲染，避免缓存
export const dynamic = "force-dynamic";

// 拖动产品到某个二级分类（subCategoryId 为 null 表示放到一级分类下）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId || "");
    const subCategoryId = body.subCategoryId ? String(body.subCategoryId) : null;
    const categoryId = body.categoryId ? String(body.categoryId) : null;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!subCategoryId && !categoryId) {
      return NextResponse.json({ error: "subCategoryId or categoryId is required" }, { status: 400 });
    }

    let data: { subCategoryId: string | null; categoryId: string | null } = {
      subCategoryId: null,
      categoryId,
    };

    if (subCategoryId) {
      const sub = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
        select: { categoryId: true },
      });
      if (!sub) {
        return NextResponse.json({ error: "subCategory not found" }, { status: 404 });
      }
      data = { subCategoryId, categoryId: sub.categoryId };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
      select: { id: true, title: true, subCategoryId: true, categoryId: true },
    });

    return NextResponse.json({ ok: true, product });
  } catch (e) {
    console.error("move-category error:", e);
    return NextResponse.json({ error: "failed to move product" }, { status: 500 });
  }
}
