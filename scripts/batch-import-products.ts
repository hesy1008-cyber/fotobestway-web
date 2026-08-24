/**
 * 产品批量导入脚本
 *
 * 用法：
 *   1. 准备 Excel 文件（参考 scripts/template-products.xlsx）
 *   2. 把产品图片放到一个文件夹（如 ./import-images/）
 *   3. 运行：npx tsx scripts/batch-import-products.ts <excel路径> [图片文件夹]
 *
 * 示例：
 *   npx tsx scripts/batch-import-products.ts ./products.xlsx ./import-images
 *
 * Excel 列说明：
 *   title*            - 产品标题（英文）
 *   slug              - 产品 URL 别名（留空自动从 title 生成）
 *   category*         - 一级分类名称（需已存在）
 *   subCategory       - 二级分类名称（需已存在，可留空）
 *   image             - 主图文件名（在图片文件夹中）
 *   gallery           - Gallery 图，多个用 | 分隔
 *   detailImages      - 详情图，多个用 | 分隔
 *   shortDescription  - 简短描述
 *   overview          - 产品概述（HTML/纯文本）
 *   features          - 特性列表，每行一条
 *   applications      - 应用场景，每行一条
 *   specs             - 规格参数（多型号 JSON 格式，见模板）
 *   video             - 视频 URL 或文件名
 *   seoTitle          - SEO 标题
 *   metaDescription   - Meta 描述
 *   focusKeywords     - 关键词，逗号分隔
 *   hiddenSeoText     - 隐藏 SEO 文本
 *   imageAlt          - 主图 Alt 文本
 */

import { prisma } from "../app/lib/prisma";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// ========== 配置 ==========
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/products");
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"];

// ========== 工具函数 ==========

/** 从标题生成 slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

/** 解析换行分隔的列表 */
function parseList(text: string | undefined | null): string[] {
  if (!text) return [];
  return String(text)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 解析 | 分隔的文件名列表 */
function parseFileList(text: string | undefined | null): string[] {
  if (!text) return [];
  return String(text)
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 解析 specs（支持多型号 JSON 和简单 key:value 格式） */
function parseSpecs(text: string | undefined | null): any {
  if (!text || !String(text).trim()) return [];

  const str = String(text).trim();

  // 尝试 JSON 解析（多型号格式）
  if (str.startsWith("[") || str.startsWith("{")) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((m: any) => m.specs && m.specs.length > 0)
          .map((m: any) => ({
            model: m.model || "",
            specs: m.specs.filter((s: any) => s.label?.trim() || s.value?.trim()),
          }));
      }
      return parsed;
    } catch {
      //  fall through to simple format
    }
  }

  // 简单格式：每行 label: value
  const lines = str.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // 检查是否有型号分组（以 === 开头的行表示型号）
  const result: any[] = [];
  let currentModel: any = null;

  for (const line of lines) {
    if (line.startsWith("===") && line.endsWith("===")) {
      // 新型号
      if (currentModel) result.push(currentModel);
      currentModel = {
        model: line.replace(/^=+|=+$/g, "").trim(),
        specs: [],
      };
    } else {
      const colonIndex = line.indexOf(":");
      const spec = colonIndex > 0
        ? { label: line.substring(0, colonIndex).trim(), value: line.substring(colonIndex + 1).trim() }
        : { label: line, value: "" };

      if (currentModel) {
        currentModel.specs.push(spec);
      } else {
        // 无型号，直接作为单型号
        if (!currentModel) {
          currentModel = { model: "", specs: [] };
        }
        currentModel.specs.push(spec);
      }
    }
  }
  if (currentModel) result.push(currentModel);

  return result.length > 0 ? result : [];
}

/** 用 sharp 处理图片并保存为 WebP（三尺寸） */
async function processImage(srcPath: string, originalName: string): Promise<string> {
  const bytes = await fs.readFile(srcPath);
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const timestamp = Date.now();
  const baseFilename = `${timestamp}-${baseName.replace(/\s+/g, "-")}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const sizes = [
    { suffix: "-thumb", width: 400, height: 400, quality: 80 },
    { suffix: "-medium", width: 800, height: 800, quality: 82 },
    { suffix: "", width: 1500, height: 1500, quality: 85 },
  ];

  for (const size of sizes) {
    const filename = `${baseFilename}${size.suffix}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await sharp(bytes)
      .resize({
        width: size.width,
        height: size.height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: size.quality, effort: 6 })
      .toFile(filePath);
  }

  return `/uploads/products/${baseFilename}.webp`;
}

/** 在图片文件夹中查找文件（支持不带扩展名） */
async function findImageFile(folder: string, name: string): Promise<string | null> {
  if (!name) return null;

  // 直接路径
  const directPath = path.isAbsolute(name) ? name : path.join(folder, name);
  try {
    const stat = await fs.stat(directPath);
    if (stat.isFile()) return directPath;
  } catch {
    // not found
  }

  // 尝试加扩展名
  for (const ext of ALLOWED_IMAGE_EXT) {
    const withExt = directPath + ext;
    try {
      const stat = await fs.stat(withExt);
      if (stat.isFile()) return withExt;
    } catch {
      // continue
    }
  }

  return null;
}

// ========== 主流程 ==========

async function main() {
  const args = process.argv.slice(2);
  const excelPath = args[0];
  const imageFolder = args[1] || path.join(process.cwd(), "import-images");

  if (!excelPath) {
    console.error("用法: npx tsx scripts/batch-import-products.ts <excel路径> [图片文件夹]");
    process.exit(1);
  }

  const absExcelPath = path.resolve(excelPath);
  const absImageFolder = path.resolve(imageFolder);

  console.log("========================================");
  console.log("产品批量导入工具");
  console.log("========================================");
  console.log("Excel 文件:", absExcelPath);
  console.log("图片文件夹:", absImageFolder);
  console.log("");

  // 检查 Excel 文件
  try {
    await fs.access(absExcelPath);
  } catch {
    console.error("错误: Excel 文件不存在:", absExcelPath);
    process.exit(1);
  }

  // 读取 Excel
  const workbook = XLSX.readFile(absExcelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, any>[];

  console.log(`读取到 ${rows.length} 条产品数据`);
  console.log("");

  if (rows.length === 0) {
    console.log("没有数据可导入");
    return;
  }

  // 预加载所有分类
  const categories = await prisma.category.findMany({ include: { subCategories: true } });
  const categoryMap = new Map<string, string>(); // name/slug -> id
  const subCategoryMap = new Map<string, string>(); // "categoryId:name" -> id

  for (const cat of categories) {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
    categoryMap.set(cat.slug.toLowerCase(), cat.id);
    for (const sub of cat.subCategories) {
      subCategoryMap.set(`${cat.id}:${sub.name.toLowerCase()}`, sub.id);
      subCategoryMap.set(`${cat.id}:${sub.slug.toLowerCase()}`, sub.id);
    }
  }

  let successCount = 0;
  let updateCount = 0;
  let skipCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // Excel 行号（含表头）

    try {
      const title = String(row.title || row.Title || "").trim();
      if (!title) {
        console.log(`[行 ${rowNum}] 跳过: 缺少 title`);
        skipCount++;
        continue;
      }

      const slug = String(row.slug || row.Slug || "").trim() || slugify(title);
      const categoryName = String(row.category || row.Category || "").trim();
      const subCategoryName = String(row.subCategory || row.SubCategory || row["sub-category"] || "").trim();

      // 查找分类
      const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) : null;
      if (categoryName && !categoryId) {
        throw new Error(`分类 "${categoryName}" 不存在，请先在后台创建`);
      }

      // 查找二级分类
      let subCategoryId: string | null = null;
      if (subCategoryName && categoryId) {
        subCategoryId = subCategoryMap.get(`${categoryId}:${subCategoryName.toLowerCase()}`) || null;
        if (!subCategoryId) {
          throw new Error(`二级分类 "${subCategoryName}" 在分类 "${categoryName}" 下不存在`);
        }
      }

      console.log(`[行 ${rowNum}] 处理: ${title} (slug: ${slug})`);

      // 处理主图
      let image = "/uploads/products/default.webp";
      const imageFile = String(row.image || row.Image || "").trim();
      if (imageFile) {
        const srcPath = await findImageFile(absImageFolder, imageFile);
        if (srcPath) {
          image = await processImage(srcPath, path.basename(imageFile));
          console.log(`  主图已上传: ${image}`);
        } else {
          console.log(`  警告: 主图文件未找到: ${imageFile}`);
        }
      }

      // 处理 Gallery
      const gallery: string[] = [];
      const galleryFiles = parseFileList(row.gallery || row.Gallery);
      for (const gf of galleryFiles) {
        const srcPath = await findImageFile(absImageFolder, gf);
        if (srcPath) {
          const url = await processImage(srcPath, path.basename(gf));
          gallery.push(url);
        } else {
          console.log(`  警告: Gallery 图未找到: ${gf}`);
        }
      }

      // 处理详情图
      const detailImages: string[] = [];
      const detailFiles = parseFileList(row.detailImages || row.DetailImages || row["detail-images"]);
      for (const df of detailFiles) {
        const srcPath = await findImageFile(absImageFolder, df);
        if (srcPath) {
          const url = await processImage(srcPath, path.basename(df));
          detailImages.push(url);
        } else {
          console.log(`  警告: 详情图未找到: ${df}`);
        }
      }

      // 文本字段
      const shortDescription = String(row.shortDescription || row["short-description"] || "").trim() || null;
      const overview = String(row.overview || row.Overview || "").trim();
      const features = parseList(row.features || row.Features);
      const applications = parseList(row.applications || row.Applications);
      const specs = parseSpecs(row.specs || row.Specs);
      const video = String(row.video || row.Video || "").trim() || null;

      // SEO 字段
      const seoTitle = String(row.seoTitle || row["seo-title"] || "").trim() || null;
      const metaDescription = String(row.metaDescription || row["meta-description"] || "").trim() || null;
      const focusKeywords = String(row.focusKeywords || row["focus-keywords"] || "").trim() || null;
      const hiddenSeoText = String(row.hiddenSeoText || row["hidden-seo-text"] || "").trim() || null;
      const imageAlt = String(row.imageAlt || row["image-alt"] || "").trim() || null;

      // 检查是否已存在
      const existing = await prisma.product.findUnique({ where: { slug } });

      const data = {
        title,
        slug,
        categoryId: categoryId || null,
        subCategoryId,
        image,
        imageAlt,
        shortDescription,
        overview,
        features,
        applications,
        specs,
        gallery,
        detailImages,
        video,
        seoTitle,
        metaDescription,
        focusKeywords,
        hiddenSeoText,
      };

      if (existing) {
        await prisma.product.update({ where: { slug }, data });
        console.log(`  ✓ 已更新`);
        updateCount++;
      } else {
        await prisma.product.create({ data });
        console.log(`  ✓ 已创建`);
        successCount++;
      }
    } catch (err: any) {
      const msg = `[行 ${rowNum}] 错误: ${err.message}`;
      console.error(`  ✗ ${msg}`);
      errors.push(msg);
    }
  }

  console.log("");
  console.log("========================================");
  console.log("导入完成");
  console.log("========================================");
  console.log(`新增: ${successCount}`);
  console.log(`更新: ${updateCount}`);
  console.log(`跳过: ${skipCount}`);
  console.log(`失败: ${errors.length}`);

  if (errors.length > 0) {
    console.log("");
    console.log("错误详情:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((err) => {
    console.error("致命错误:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
