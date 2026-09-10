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

// 清洗用户手动填写的 slug：只保留小写字母/数字/连字符/下划线
// 空格转成下划线（如 "FVTB-2300 FVTB-2500" -> "fvtb-2300_fvtb-2500"，两个型号可区分）
// 其余非法字符直接删除
function cleanSlug(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]+/g, "")
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

        // slug 清洗：手动填写的 slug 转小写、空格/非法字符转成 -，避免网址含空格导致详情页 404
        // 中文标题 slugify 后可能为空，兜底生成唯一 slug
        const slug =
          cleanSlug(p.slug) ||
          slugify(title) ||
          `product-${Date.now()}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`;

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

        const gallery = parseStringArray(p.gallery);
        const detailImages = parseStringArray(p.detailImages);
        // 轮播图第一张自动作为主图（与新增/编辑产品规则一致）
        const image = String(p.image || gallery[0] || "/uploads/products/default.webp");

        const data = {
          title,
          slug,
          categoryId,
          subCategoryId,
          image,
          imageAlt: p.imageAlt ? String(p.imageAlt) : null,
          shortDescription: p.shortDescription ? String(p.shortDescription) : null,
          overview: String(p.overview || ""),
          features: parseList(p.features),
          applications: parseList(p.applications),
          specs: parseSpecs(p.specs),
          gallery,
          detailImages,
          video: p.video ? String(p.video) : null,
          seoTitle: p.seoTitle ? String(p.seoTitle) : null,
          metaDescription: p.metaDescription ? String(p.metaDescription) : null,
          focusKeywords: p.focusKeywords ? String(p.focusKeywords) : null,
          hiddenSeoText: p.hiddenSeoText ? String(p.hiddenSeoText) : null,
        };

        // 允许标题相同：slug 冲突时自动追加后缀保证唯一，绝不覆盖已有产品
        let finalSlug = slug;
        let suffix = 2;
        while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
          finalSlug = `${slug}-${suffix}`;
          suffix++;
        }
        data.slug = finalSlug;

        await prisma.product.create({ data });
        results.push({ index: i, title, slug: finalSlug, status: "created" });
        successCount++;
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
