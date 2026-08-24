import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

/**
 * 批量导入产品 API
 *
 * POST /api/batch-import
 * Body: JSON 数组，每个元素是一个产品对象
 *
 * 图片字段（image, gallery, detailImages）传 URL 字符串（已通过 /api/upload 上传）
 * 不传文件，直接写数据库
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function parseSpecs(specs: any): any {
  if (!specs) return [];
  if (Array.isArray(specs)) return specs;
  if (typeof specs === "string") {
    try {
      return JSON.parse(specs);
    } catch {
      return [];
    }
  }
  return [];
}

function parseList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseStringArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const products = Array.isArray(body) ? body : body.products;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "No products provided" },
        { status: 400 }
      );
    }

    // 预加载分类
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    const categoryMap = new Map<string, string>();
    const subCategoryMap = new Map<string, string>();

    for (const cat of categories) {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
      for (const sub of cat.subCategories) {
        subCategoryMap.set(`${cat.id}:${sub.name.toLowerCase()}`, sub.id);
        subCategoryMap.set(`${cat.id}:${sub.slug.toLowerCase()}`, sub.id);
      }
    }

    const results = [];
    let successCount = 0;
    let updateCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        const title = String(p.title || "").trim();
        if (!title) {
          throw new Error("title is required");
        }

        const slug = String(p.slug || "").trim() || slugify(title);

        // 分类
        let categoryId: string | null = null;
        if (p.categoryId) {
          categoryId = p.categoryId;
        } else if (p.category) {
          categoryId = categoryMap.get(String(p.category).toLowerCase()) || null;
        }

        let subCategoryId: string | null = null;
        if (p.subCategoryId) {
          subCategoryId = p.subCategoryId;
        } else if (p.subCategory && categoryId) {
          subCategoryId =
            subCategoryMap.get(`${categoryId}:${String(p.subCategory).toLowerCase()}`) || null;
        }

        const data = {
          title,
          slug,
          categoryId,
          subCategoryId,
          image: String(p.image || "/uploads/products/default.webp"),
          imageAlt: p.imageAlt ? String(p.imageAlt) : null,
          shortDescription: p.shortDescription ? String(p.shortDescription) : null,
          overview: String(p.overview || ""),
          features: parseList(p.features),
          applications: parseList(p.applications),
          specs: parseSpecs(p.specs),
          gallery: parseStringArray(p.gallery),
          detailImages: parseStringArray(p.detailImages),
          video: p.video ? String(p.video) : null,
          seoTitle: p.seoTitle ? String(p.seoTitle) : null,
          metaDescription: p.metaDescription ? String(p.metaDescription) : null,
          focusKeywords: p.focusKeywords ? String(p.focusKeywords) : null,
          hiddenSeoText: p.hiddenSeoText ? String(p.hiddenSeoText) : null,
        };

        const existing = await prisma.product.findUnique({ where: { slug } });

        if (existing) {
          await prisma.product.update({ where: { slug }, data });
          results.push({ index: i, title, slug, status: "updated" });
          updateCount++;
        } else {
          await prisma.product.create({ data });
          results.push({ index: i, title, slug, status: "created" });
          successCount++;
        }
      } catch (err: any) {
        results.push({
          index: i,
          title: p.title || `Product #${i}`,
          status: "failed",
          error: err.message,
        });
        failCount++;
      }
    }

    return NextResponse.json({
      total: products.length,
      created: successCount,
      updated: updateCount,
      failed: failCount,
      results,
    });
  } catch (err: any) {
    console.error("Batch import error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
