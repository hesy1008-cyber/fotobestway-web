import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * 同一分组内的产品排序
 * body: { ids: string[], categoryId: string, subCategoryId?: string | null }
 * - 传 subCategoryId 时按该二级分类内排序
 * - subCategoryId 为空时按「直接挂在一级分类下（无二级分类）」这组排序
 */
export async function POST(req: NextRequest) {
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawIds: unknown[] = Array.isArray(body.ids) ? body.ids : [];
    const ids = rawIds.map((x) => String(x));
    const subCategoryId = body.subCategoryId ? String(body.subCategoryId) : null;
    const categoryId = body.categoryId ? String(body.categoryId) : null;

    if (ids.length === 0) {
      return NextResponse.json({ error: "ids is required" }, { status: 400 });
    }
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "duplicate ids" }, { status: 400 });
    }
    if (!subCategoryId && !categoryId) {
      return NextResponse.json(
        { error: "subCategoryId or categoryId is required" },
        { status: 400 }
      );
    }

    let where: { subCategoryId: string } | { subCategoryId: null; categoryId: string };

    if (subCategoryId) {
      const sub = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
        select: { categoryId: true },
      });
      if (!sub) {
        return NextResponse.json({ error: "subCategory not found" }, { status: 404 });
      }
      where = { subCategoryId };
    } else {
      if (!categoryId) {
        return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
      }
      where = { subCategoryId: null, categoryId };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true },
    });
    const existingIds = products.map((p) => p.id);

    const unknownIds = ids.filter((id) => !existingIds.includes(id));
    if (unknownIds.length > 0) {
      return NextResponse.json(
        { error: "some products do not belong to this group" },
        { status: 400 }
      );
    }

    // 未传入的产品按原顺序补到末尾
    const rest = existingIds.filter((id) => !ids.includes(id));
    const orderedIds = [...ids, ...rest];

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.product.update({ where: { id }, data: { sortOrder: index } })
      )
    );

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reorder products error:", e);
    return NextResponse.json({ error: "failed to reorder products" }, { status: 500 });
  }
}
