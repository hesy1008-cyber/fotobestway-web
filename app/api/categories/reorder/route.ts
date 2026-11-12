import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

// 强制动态渲染，避免缓存
export const dynamic = "force-dynamic";

// 调整一级分类顺序：按传入的 ids 顺序重排 sortOrder
// 未传入的分类保持原有相对顺序，追加到末尾，保证序号连续
export async function POST(req: NextRequest) {
  const role = await requireAdminRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
    const ids: string[] = rawIds.map((id) => String(id)).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "ids is required" }, { status: 400 });
    }
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "duplicate category id" }, { status: 400 });
    }

    const existing = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    const validIds = new Set(existing.map((c) => c.id));

    if (ids.some((id) => !validIds.has(id))) {
      return NextResponse.json({ error: "category not found" }, { status: 404 });
    }

    // 传入的按给定顺序在前，未传入的按当前顺序补在后面
    const orderedIds = [
      ...ids,
      ...existing.map((c) => c.id).filter((id) => !ids.includes(id)),
    ];

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index },
          select: { id: true },
        })
      )
    );

    // 首页、产品页、导航栏均读取 sortOrder，统一失效缓存
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true, order: orderedIds });
  } catch (e) {
    console.error("reorder categories error:", e);
    return NextResponse.json({ error: "failed to reorder categories" }, { status: 500 });
  }
}
