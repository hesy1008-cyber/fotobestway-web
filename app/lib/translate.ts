// 简单的内存缓存
const cache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

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

export async function translateText(text: string, from = "en", to = "zh-CN"): Promise<string> {
  if (!text || !text.trim()) return text;

  const cacheKey = `${from}:${to}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.text;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }, 5000);

    if (!res.ok) return text;

    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    if (!translated) return text;

    cache.set(cacheKey, { text: translated, timestamp: Date.now() });
    return translated;
  } catch (error) {
    // 翻译失败快速返回原文，不卡住页面
    return text;
  }
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
