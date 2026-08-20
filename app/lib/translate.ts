import crypto from "crypto";
import { prisma } from "./prisma";

// 简单的内存缓存
const cache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

// 计算文本的 hash，用于数据库快速查找
function hashText(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

// 带超时的 fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// 分割长文本为多段，每段不超过 maxLen 字符
function splitLongText(text: string, maxLen = 450): string[] {
  if (text.length <= maxLen) return [text];

  const segments: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      segments.push(remaining);
      break;
    }

    // 优先在段落结束处分割（\n\n）
    let splitPos = remaining.lastIndexOf("\n\n", maxLen);
    // 其次在换行处分割
    if (splitPos < 100) splitPos = remaining.lastIndexOf("\n", maxLen);
    // 其次在句号处分割
    if (splitPos < 100) {
      const periodPos = Math.max(
        remaining.lastIndexOf(". ", maxLen),
        remaining.lastIndexOf("。", maxLen)
      );
      if (periodPos > 100) splitPos = periodPos + 1;
    }
    // 最后在空格处分割
    if (splitPos < 100) splitPos = remaining.lastIndexOf(" ", maxLen);
    // 实在不行就硬分割
    if (splitPos < 100) splitPos = maxLen;

    segments.push(remaining.substring(0, splitPos).trim());
    remaining = remaining.substring(splitPos).trim();
  }

  return segments.filter((s) => s.length > 0);
}

// 单段翻译（不超过500字符）
async function translateSingle(text: string, from = "en", to = "zh-CN"): Promise<string> {
  if (!text || !text.trim()) return text;

  // 一级缓存：内存
  const cacheKey = `${from}:${to}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.text;
  }

  // 二级缓存：数据库（永久缓存，翻译过的内容永远不会再调用 API）
  const sourceHash = hashText(text);
  try {
    const dbCached = await prisma.translationCache.findUnique({
      where: { sourceHash_fromLang_toLang: { sourceHash, fromLang: from, toLang: to } },
    });
    if (dbCached) {
      cache.set(cacheKey, { text: dbCached.translatedText, timestamp: Date.now() });
      return dbCached.translatedText;
    }
  } catch (e) {
    // 数据库查询失败，继续调用 API
  }

  // 调用翻译 API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }, 10000);

    if (!res.ok) return text;

    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    // 过滤掉 API 错误信息和额度警告
    if (!translated || 
        translated.includes("QUERY LENGTH LIMIT") || 
        translated.includes("MAX ALLOWED QUERY") ||
        translated.includes("MYMEMORY WARNING") ||
        translated.includes("USED ALL AVAILABLE FREE") ||
        translated.includes("NEXT AVAILABLE IN")) {
      return text;
    }

    // 缓存到内存
    cache.set(cacheKey, { text: translated, timestamp: Date.now() });

    // 缓存到数据库（以后永远不会再调用 API 翻译这段文本）
    try {
      await prisma.translationCache.create({
        data: {
          sourceHash,
          sourceText: text,
          translatedText: translated,
          fromLang: from,
          toLang: to,
        },
      });
    } catch (e) {
      // 数据库写入失败（可能重复），忽略
    }

    return translated;
  } catch (error) {
    return text;
  }
}

export async function translateText(text: string, from = "en", to = "zh-CN"): Promise<string> {
  if (!text || !text.trim()) return text;

  // 长文本分段翻译
  if (text.length > 450) {
    const segments = splitLongText(text, 450);
    const translatedSegments = await Promise.all(
      segments.map((seg) => translateSingle(seg, from, to))
    );
    return translatedSegments.join("\n\n");
  }

  return translateSingle(text, from, to);
}

// 翻译产品对象的所有文本字段（并发）
export async function translateProduct(product: any): Promise<any> {
  if (!product) return product;

  const tasks: Promise<void>[] = [];
  const translated: any = { ...product };

  // 简单文本字段
  const textFields = ["title", "shortDescription", "overview", "description", "hiddenSeoText"];
  for (const field of textFields) {
    if (product[field]) {
      tasks.push(
        translateText(product[field]).then((result) => {
          translated[field] = result;
        })
      );
    }
  }

  // features 数组
  if (Array.isArray(product.features)) {
    tasks.push(
      Promise.all(product.features.map((f: string) => translateText(f))).then((results) => {
        translated.features = results;
      })
    );
  }

  // applications 数组
  if (Array.isArray(product.applications)) {
    tasks.push(
      Promise.all(product.applications.map((a: string) => translateText(a))).then((results) => {
        translated.applications = results;
      })
    );
  }

  // specs
  if (Array.isArray(product.specs)) {
    tasks.push(
      Promise.all(
        product.specs.map(async (s: any) => ({
          ...s,
          label: s.label ? await translateText(s.label) : s.label,
          value: s.value ? await translateText(s.value) : s.value,
        }))
      ).then((results) => {
        translated.specs = results;
      })
    );
  } else if (typeof product.specs === "object" && product.specs) {
    tasks.push(
      Promise.all(
        Object.entries(product.specs).map(async ([key, value]) => [
          key,
          value ? await translateText(value as string) : value,
        ])
      ).then((entries) => {
        translated.specs = Object.fromEntries(entries);
      })
    );
  }

  // featureIcons
  if (Array.isArray(product.featureIcons)) {
    tasks.push(
      Promise.all(
        product.featureIcons.map(async (f: any) => ({
          ...f,
          text: f.text ? await translateText(f.text) : f.text,
        }))
      ).then((results) => {
        translated.featureIcons = results;
      })
    );
  }

  await Promise.all(tasks);
  return translated;
}

// 翻译产品列表（翻译标题、描述和特性）
export async function translateProductList(products: any[]): Promise<any[]> {
  return Promise.all(
    products.map(async (product) => {
      const translated = { ...product };
      const tasks: Promise<void>[] = [];

      if (product.title) {
        tasks.push(
          translateText(product.title).then((result) => {
            translated.title = result;
          })
        );
      }
      if (product.overview) {
        tasks.push(
          translateText(product.overview).then((result) => {
            translated.overview = result;
          })
        );
      }
      if (product.shortDescription) {
        tasks.push(
          translateText(product.shortDescription).then((result) => {
            translated.shortDescription = result;
          })
        );
      }
      if (Array.isArray(product.features)) {
        tasks.push(
          Promise.all(product.features.map((f: string) => translateText(f))).then((results) => {
            translated.features = results;
          })
        );
      }

      await Promise.all(tasks);
      return translated;
    })
  );
}
