import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * 二级分类排序
 * body: { categoryId: string, ids: string[] } —— ids 为该一级分类下二级分类的目标顺序
 */
export async function POST(req: NextRequest) {
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const categoryId = String(body.categoryId || "");
    const rawIds: unknown[] = Array.isArray(body.ids) ? body.ids : [];
    const ids = rawIds.map((x) => String(x));

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }
    if (ids.length === 0) {
      return NextResponse.json({ error: "ids is required" }, { status: 400 });
    }
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "duplicate ids" }, { status: 400 });
    }

    const subs = await prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    });
    const existingIds = subs.map((s) => s.id);

    const unknownIds = ids.filter((id) => !existingIds.includes(id));
    if (unknownIds.length > 0) {
      return NextResponse.json(
        { error: "some subcategories do not belong to this category" },
        { status: 400 }
      );
    }

    // 未传入的二级分类保持原顺序，追加到末尾
    const rest = existingIds.filter((id) => !ids.includes(id));
    const orderedIds = [...ids, ...rest];

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.subCategory.update({ where: { id }, data: { sortOrder: index } })
      )
    );

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("reorder subcategories error:", e);
    return NextResponse.json({ error: "failed to reorder subcategories" }, { status: 500 });
  }
}
