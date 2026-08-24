"use client";

import { useState, useRef, useCallback } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  subCategories: { id: string; name: string; slug: string }[];
};

type SpecItem = { label: string; value: string };
type SpecModel = { model: string; specs: SpecItem[] };

type ProductDraft = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  image: string;
  gallery: string[];
  detailImages: string[];
  shortDescription: string;
  overview: string;
  features: string[];
  applications: string[];
  specs: SpecModel[];
  video: string;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string;
  hiddenSeoText: string;
  imageAlt: string;
  expanded: boolean;
  importStatus?: "pending" | "success" | "failed";
  importError?: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

// 从文案表格解析产品
function parseSheetToProduct(
  sheetData: any[][],
  sheetName: string,
  categories: Category[] = []
): ProductDraft[] {
  if (!sheetData || sheetData.length === 0) return [];

  const getCell = (row: number, col: number) => {
    const v = sheetData[row]?.[col];
    return v !== undefined && v !== null ? String(v).trim() : "";
  };

  // ========== 第一步：扫描全表，收集共用信息 ==========

  // 收集所有大品名行：{ row, title }
  const titleRows: { row: number; title: string }[] = [];
  for (let row = 0; row < sheetData.length; row++) {
    for (let col = 0; col < Math.min(sheetData[row]?.length || 0, 5); col++) {
      if (getCell(row, col) === "大品名") {
        const title = getCell(row, col + 1);
        if (title) titleRows.push({ row, title: title.trim() });
        break;
      }
    }
  }

  // 收集所有 ITEM# 行的位置
  const itemRows: number[] = [];
  for (let row = 0; row < sheetData.length; row++) {
    if (getCell(row, 0).toUpperCase() === "ITEM#") {
      itemRows.push(row);
    }
  }

  // 找 description 和 advantage（所有产品共用）
  let overview = "";
  let features: string[] = [];
  for (let row = 0; row < sheetData.length; row++) {
    const cell0 = getCell(row, 0);
    if (cell0.toLowerCase().includes("the description of product")) {
      overview = getCell(row + 1, 0);
    }
    if (cell0.toLowerCase().includes("the advantage of product")) {
      for (let r = row + 1; r < sheetData.length; r++) {
        const val = getCell(r, 0);
        if (!val) break;
        if (val.toLowerCase().includes("the feature")) break;
        const cleaned = val.replace(/^\d+\.\s*/, "").trim();
        if (cleaned) features.push(cleaned);
      }
    }
  }

  // 找大类（所有产品共用）
  let category = "";
  for (let row = 0; row < Math.min(sheetData.length, 15); row++) {
    for (let col = 0; col < Math.min(sheetData[row]?.length || 0, 12); col++) {
      const cell = getCell(row, col);
      if (cell.includes("大类")) {
        const extracted = cell.replace(/大类[：:]\s*/i, "").trim();
        category = extracted || getCell(row, col + 1);
        break;
      }
    }
    if (category) break;
  }

  // 模糊匹配数据库分类
  if (category && categories.length > 0) {
    const normalize = (s: string) =>
      s.toLowerCase().replace(/\s+/g, "").replace(/s$/, "");
    const matched = categories.find((c) => normalize(c.name) === normalize(category));
    if (matched) category = matched.name;
  }

  // ========== 第二步：读取某个 ITEM# 行的型号和规格参数 ==========
  function readSpecsFromItemRow(itemRow: number): SpecModel[] {
    // 读取型号
    const models: string[] = [];
    for (let col = 1; col < 10; col++) {
      const val = getCell(itemRow, col);
      if (!val) continue;
      const hasLetter = /[a-zA-Z]/.test(val);
      const hasDigit = /\d/.test(val);
      const isAllChinese = /^[\u4e00-\u9fa5]+$/.test(val);
      if (isAllChinese) continue;
      if (!hasLetter && !hasDigit) continue;
      models.push(val);
    }

    const specs: SpecModel[] = models.map((m) => ({ model: m, specs: [] }));
    const seenLabels = models.map(() => new Set<string>());

    for (let row = itemRow + 1; row < sheetData.length; row++) {
      const label = getCell(row, 0);
      if (!label) break;
      if (
        label.toUpperCase() === "ITEM#" ||
        label === "大品名" ||
        label.includes("原厂型号") ||
        label.includes("产品链接") ||
        label.includes("参考链接") ||
        label.toLowerCase().includes("the description") ||
        label.toLowerCase().includes("the advantage") ||
        label.toLowerCase().includes("the feature")
      ) {
        break;
      }
      for (let mi = 0; mi < models.length; mi++) {
        const value = getCell(row, 1 + mi);
        if (!value) continue;
        if (seenLabels[mi].has(label)) continue;
        seenLabels[mi].add(label);
        specs[mi].specs.push({ label, value });
      }
    }

    return specs.filter((s) => s.specs.length > 0);
  }

  // ========== 第三步：为每个大品名生成一款产品 ==========

  // 找到 description 区块的起始行（作为 ITEM# 搜索的上界）
  let descRow = sheetData.length;
  for (let row = 0; row < sheetData.length; row++) {
    if (getCell(row, 0).toLowerCase().includes("the description of product")) {
      descRow = row;
      break;
    }
  }

  function buildProduct(title: string, itemRow: number | null): ProductDraft {
    const specs = itemRow !== null ? readSpecsFromItemRow(itemRow) : [];
    const plainOverview = overview.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const shortDescription = plainOverview.length > 120 ? plainOverview.slice(0, 117) + "..." : plainOverview;

    return {
      id: uid(),
      title,
      slug: slugify(title),
      category,
      subCategory: "",
      image: "",
      gallery: [],
      detailImages: [],
      shortDescription,
      overview,
      features,
      applications: [],
      specs,
      video: "",
      seoTitle: title + " | FOTOBESTWAY Professional Photography Equipment",
      metaDescription: shortDescription,
      focusKeywords: title.toLowerCase().split(/\s+/).slice(0, 5).join(", "),
      hiddenSeoText: "",
      imageAlt: title + " product photo",
      expanded: true,
    };
  }

  const products: ProductDraft[] = [];

  if (titleRows.length > 0) {
    // 有大品名：每个大品名一款产品
    for (let i = 0; i < titleRows.length; i++) {
      const { row: titleRow, title } = titleRows[i];
      const nextTitleRow = i + 1 < titleRows.length ? titleRows[i + 1].row : descRow;

      // 找这个大品名后面最近的 ITEM# 行（在下一个大品名或 description 之前）
      let itemRow: number | null = null;
      for (const ir of itemRows) {
        if (ir > titleRow && ir < nextTitleRow) {
          itemRow = ir;
          break;
        }
      }
      // 如果后面没有，找前面最近的 ITEM# 行
      if (itemRow === null) {
        for (let j = itemRows.length - 1; j >= 0; j--) {
          if (itemRows[j] < titleRow) {
            itemRow = itemRows[j];
            break;
          }
        }
      }

      products.push(buildProduct(title, itemRow));
    }
  } else {
    // 没有大品名：用 sheetName 作为标题，用第一个 ITEM# 区块
    const itemRow = itemRows.length > 0 ? itemRows[0] : null;
    products.push(buildProduct(sheetName, itemRow));
  }

  return products;
}

export default function BatchImportClient({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理 Excel 文件
  const handleFile = useCallback(async (file: File) => {
    const XLSXmod = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSXmod.read(buffer, { type: "array" });

    const parsed: ProductDraft[] = [];
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSXmod.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
      const sheetProducts = parseSheetToProduct(data, sheetName, categories);
      parsed.push(...sheetProducts);
    }

    setProducts((prev) => [...prev, ...parsed]);
    setImportResult(null);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // 更新产品字段
  const updateProduct = (id: string, patch: Partial<ProductDraft>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  // 上传图片
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  };

  const handleImageUpload = async (id: string, field: "image" | "gallery" | "detailImages", files: FileList) => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        urls.push(url);
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }
    if (field === "image") {
      updateProduct(id, { image: urls[0] || "" });
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: [...(p[field] as string[]), ...urls] } : p))
      );
    }
  };

  const removeImage = (id: string, field: "image" | "gallery" | "detailImages", index?: number) => {
    if (field === "image") {
      updateProduct(id, { image: "" });
    } else {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const arr = [...(p[field] as string[])];
          if (index !== undefined) arr.splice(index, 1);
          return { ...p, [field]: arr };
        })
      );
    }
  };

  // 批量导入
  const handleImport = async () => {
    if (products.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    // 逐个导入（显示进度）
    const results = [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        const res = await fetch("/api/batch-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              title: p.title,
              slug: p.slug,
              category: p.category,
              subCategory: p.subCategory,
              image: p.image || undefined,
              gallery: p.gallery,
              detailImages: p.detailImages,
              shortDescription: p.shortDescription,
              overview: p.overview,
              features: p.features,
              applications: p.applications,
              specs: p.specs,
              video: p.video,
              seoTitle: p.seoTitle,
              metaDescription: p.metaDescription,
              focusKeywords: p.focusKeywords,
              hiddenSeoText: p.hiddenSeoText,
              imageAlt: p.imageAlt,
            },
          ]),
        });
        const data = await res.json();
        results.push(data);
        updateProduct(p.id, {
          importStatus: data.failed > 0 ? "failed" : "success",
          importError: data.results?.[0]?.error,
        });
      } catch (e: any) {
        results.push({ error: e.message });
        updateProduct(p.id, { importStatus: "failed", importError: e.message });
      }
      setImportProgress(Math.round(((i + 1) / products.length) * 100));
    }

    const created = results.filter((r) => r.created > 0).length;
    const updated = results.filter((r) => r.updated > 0).length;
    const failed = results.filter((r) => r.failed > 0 || r.error).length;
    setImportResult({ total: products.length, created, updated, failed });
    setIsImporting(false);
  };

  const clearAll = () => {
    setProducts([]);
    setImportResult(null);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* 上传区域 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "#dc2626" : "#ccc"}`,
          borderRadius: "8px",
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "#fef2f2" : "#fafafa",
          marginBottom: "20px",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <div style={{ fontSize: "18px", marginBottom: "8px", color: "#333" }}>
          📊 拖拽 Excel 文件到这里，或点击选择
        </div>
        <div style={{ fontSize: "13px", color: "#888" }}>
          支持 .xls / .xlsx 格式，每个 Sheet 自动解析为一个产品
        </div>
      </div>

      {/* 操作栏 */}
      {products.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#1a1a1a",
            borderRadius: "6px",
            color: "#fff",
          }}
        >
          <span>
            已解析 <strong style={{ color: "#dc2626" }}>{products.length}</strong> 个产品
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={clearAll}
              style={{
                padding: "8px 16px",
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              清空
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              style={{
                padding: "8px 24px",
                background: isImporting ? "#999" : "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: isImporting ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {isImporting ? `导入中 ${importProgress}%` : "一键批量导入"}
            </button>
          </div>
        </div>
      )}

      {/* 导入结果 */}
      {importResult && (
        <div
          style={{
            padding: "16px",
            background: importResult.failed > 0 ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${importResult.failed > 0 ? "#fecaca" : "#bbf7d0"}`,
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <strong>导入完成：</strong>
          共 {importResult.total} 个，
          新增 <span style={{ color: "#16a34a" }}>{importResult.created}</span>，
          更新 <span style={{ color: "#2563eb" }}>{importResult.updated}</span>，
          失败 <span style={{ color: "#dc2626" }}>{importResult.failed}</span>
        </div>
      )}

      {/* 进度条 */}
      {isImporting && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              height: "6px",
              background: "#eee",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${importProgress}%`,
                background: "#dc2626",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      )}

      {/* 产品列表 */}
      {products.map((p, idx) => (
        <ProductCard
          key={p.id}
          product={p}
          index={idx}
          categories={categories}
          onUpdate={(patch) => updateProduct(p.id, patch)}
          onRemove={() => removeProduct(p.id)}
          onImageUpload={(field, files) => handleImageUpload(p.id, field, files)}
          onRemoveImage={(field, index) => removeImage(p.id, field, index)}
        />
      ))}

      {products.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "#999" }}>
          还没有产品，上传 Excel 开始
        </div>
      )}
    </div>
  );
}

// ========== 产品卡片组件 ==========
function ProductCard({
  product,
  index,
  categories,
  onUpdate,
  onRemove,
  onImageUpload,
  onRemoveImage,
}: {
  product: ProductDraft;
  index: number;
  categories: Category[];
  onUpdate: (patch: Partial<ProductDraft>) => void;
  onRemove: () => void;
  onImageUpload: (field: "image" | "gallery" | "detailImages", files: FileList) => void;
  onRemoveImage: (field: "image" | "gallery" | "detailImages", index?: number) => void;
}) {
  const [tab, setTab] = useState<"basic" | "content" | "images" | "seo">("basic");

  const selectedCategory = categories.find(
    (c) => c.name.toLowerCase() === product.category.toLowerCase()
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        marginBottom: "16px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* 卡片头 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#fafafa",
          borderBottom: "1px solid #eee",
          cursor: "pointer",
        }}
        onClick={() => onUpdate({ expanded: !product.expanded })}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#999", fontSize: "13px" }}>#{index + 1}</span>
          <strong style={{ fontSize: "15px" }}>{product.title || "(无标题)"}</strong>
          {product.importStatus === "success" && (
            <span style={{ fontSize: "11px", color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>
              ✓ 已导入
            </span>
          )}
          {product.importStatus === "failed" && (
            <span style={{ fontSize: "11px", color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: "10px" }}>
              ✗ 失败
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {product.image && (
            <img
              src={product.image}
              alt=""
              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              padding: "4px 10px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            删除
          </button>
          <span style={{ color: "#999" }}>{product.expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {product.expanded && (
        <div style={{ padding: "16px" }}>
          {/* Tab 切换 */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: "2px solid #eee" }}>
            {(["basic", "content", "images", "seo"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: tab === t ? "bold" : "normal",
                  color: tab === t ? "#dc2626" : "#666",
                  borderBottom: tab === t ? "2px solid #dc2626" : "2px solid transparent",
                  marginBottom: "-2px",
                }}
              >
                {t === "basic" ? "基本信息" : t === "content" ? "文案内容" : t === "images" ? "图片上传" : "SEO"}
              </button>
            ))}
          </div>

          {/* 基本信息 */}
          {tab === "basic" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>产品标题 Title *</label>
                <input
                  style={inputStyle}
                  value={product.title}
                  onChange={(e) => onUpdate({ title: e.target.value, slug: slugify(e.target.value) })}
                />
              </div>
              <div>
                <label style={labelStyle}>Slug（留空自动生成）</label>
                <input style={inputStyle} value={product.slug} onChange={(e) => onUpdate({ slug: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>一级分类 Category *</label>
                <select
                  style={inputStyle}
                  value={product.category}
                  onChange={(e) => onUpdate({ category: e.target.value, subCategory: "" })}
                >
                  <option value="">请选择</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>二级分类 SubCategory</label>
                <select
                  style={inputStyle}
                  value={product.subCategory}
                  onChange={(e) => onUpdate({ subCategory: e.target.value })}
                >
                  <option value="">无</option>
                  {selectedCategory?.subCategories.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>简短描述 Short Description</label>
                <input
                  style={inputStyle}
                  value={product.shortDescription}
                  onChange={(e) => onUpdate({ shortDescription: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* 文案内容 */}
          {tab === "content" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>产品概述 Overview（支持 HTML）</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                  value={product.overview}
                  onChange={(e) => onUpdate({ overview: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>产品特性 Features（每行一条）</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={product.features.join("\n")}
                  onChange={(e) => onUpdate({ features: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
              <div>
                <label style={labelStyle}>应用场景 Applications（每行一条）</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={product.applications.join("\n")}
                  onChange={(e) => onUpdate({ applications: e.target.value.split("\n").filter(Boolean) })}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  规格参数 Specs
                  <span style={{ color: "#999", fontWeight: "normal", marginLeft: "8px" }}>
                    当前 {product.specs.length} 个型号
                  </span>
                  <button
                    onClick={() => {
                      const newSpecs = [...product.specs, { model: "", specs: [{ label: "", value: "" }] }];
                      onUpdate({ specs: newSpecs });
                    }}
                    style={{
                      marginLeft: "12px",
                      padding: "2px 10px",
                      fontSize: "11px",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    + 添加型号
                  </button>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  {product.specs.map((specModel, mi) => (
                    <div key={mi} style={{ border: "1px solid #e5e5e5", borderRadius: "6px", padding: "10px", background: "#fafafa" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: "#555", minWidth: "50px" }}>型号 {mi + 1}</span>
                        <input
                          style={{ ...inputStyle, flex: 1, padding: "4px 8px", fontSize: "12px" }}
                          value={specModel.model}
                          placeholder="型号名称（如 FT-2200CK-3）"
                          onChange={(e) => {
                            const newSpecs = product.specs.map((m, i) =>
                              i === mi ? { ...m, model: e.target.value } : m
                            );
                            onUpdate({ specs: newSpecs });
                          }}
                        />
                        <button
                          onClick={() => {
                            const newSpecs = product.specs.filter((_, i) => i !== mi);
                            onUpdate({ specs: newSpecs });
                          }}
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          删除型号
                        </button>
                      </div>

                      {/* 参数表头 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#999", paddingLeft: "4px" }}>参数名</span>
                        <span style={{ fontSize: "11px", color: "#999", paddingLeft: "4px" }}>参数值</span>
                        <span></span>
                      </div>

                      {specModel.specs.map((spec, si) => (
                        <div key={si} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: "8px", marginBottom: "4px" }}>
                          <input
                            style={{ ...inputStyle, padding: "4px 8px", fontSize: "12px" }}
                            value={spec.label}
                            placeholder="如 Max Height(cm)"
                            onChange={(e) => {
                              const newSpecs = product.specs.map((m, i) =>
                                i === mi
                                  ? {
                                      ...m,
                                      specs: m.specs.map((s, j) =>
                                        j === si ? { ...s, label: e.target.value } : s
                                      ),
                                    }
                                  : m
                              );
                              onUpdate({ specs: newSpecs });
                            }}
                          />
                          <input
                            style={{ ...inputStyle, padding: "4px 8px", fontSize: "12px" }}
                            value={spec.value}
                            placeholder="如 211"
                            onChange={(e) => {
                              const newSpecs = product.specs.map((m, i) =>
                                i === mi
                                  ? {
                                      ...m,
                                      specs: m.specs.map((s, j) =>
                                        j === si ? { ...s, value: e.target.value } : s
                                      ),
                                    }
                                  : m
                              );
                              onUpdate({ specs: newSpecs });
                            }}
                          />
                          <button
                            onClick={() => {
                              const newSpecs = product.specs.map((m, i) =>
                                i === mi
                                  ? { ...m, specs: m.specs.filter((_, j) => j !== si) }
                                  : m
                              );
                              onUpdate({ specs: newSpecs });
                            }}
                            style={{
                              padding: "4px",
                              fontSize: "14px",
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              lineHeight: "1",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newSpecs = product.specs.map((m, i) =>
                            i === mi ? { ...m, specs: [...m.specs, { label: "", value: "" }] } : m
                          );
                          onUpdate({ specs: newSpecs });
                        }}
                        style={{
                          marginTop: "4px",
                          padding: "4px 12px",
                          fontSize: "11px",
                          background: "#e5e5e5",
                          color: "#333",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        + 添加参数
                      </button>
                    </div>
                  ))}

                  {product.specs.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#999", fontSize: "12px" }}>
                      暂无规格参数，点击上方「+ 添加型号」开始
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 图片上传 */}
          {tab === "images" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* 主图 */}
              <div>
                <label style={labelStyle}>产品主图 Main Image</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  {product.image ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={product.image}
                        alt=""
                        style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                      />
                      <button
                        onClick={() => onRemoveImage("image")}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        width: "120px",
                        height: "120px",
                        border: "2px dashed #ccc",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#999",
                      }}
                    >
                      + 上传主图
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files) onImageUpload("image", e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label style={labelStyle}>画廊图 Gallery（可多张）</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {product.gallery.map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={url}
                        alt=""
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                      />
                      <button
                        onClick={() => onRemoveImage("gallery", i)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "2px dashed #ccc",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "11px",
                      color: "#999",
                    }}
                  >
                    + 添加
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files) onImageUpload("gallery", e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 详情图 */}
              <div>
                <label style={labelStyle}>详情图 Detail Images（可多张）</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {product.detailImages.map((url, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={url}
                        alt=""
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                      />
                      <button
                        onClick={() => onRemoveImage("detailImages", i)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "2px dashed #ccc",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "11px",
                      color: "#999",
                    }}
                  >
                    + 添加
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files) onImageUpload("detailImages", e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={labelStyle}>主图 Alt 文本</label>
                <input style={inputStyle} value={product.imageAlt} onChange={(e) => onUpdate({ imageAlt: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>视频 URL</label>
                <input style={inputStyle} value={product.video} onChange={(e) => onUpdate({ video: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          )}

          {/* SEO */}
          {tab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>SEO Title</label>
                <input style={inputStyle} value={product.seoTitle} onChange={(e) => onUpdate({ seoTitle: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Meta Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
                  value={product.metaDescription}
                  onChange={(e) => onUpdate({ metaDescription: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Focus Keywords（逗号分隔）</label>
                <input style={inputStyle} value={product.focusKeywords} onChange={(e) => onUpdate({ focusKeywords: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Hidden SEO Text（爬虫可见，前台隐藏）</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={product.hiddenSeoText}
                  onChange={(e) => onUpdate({ hiddenSeoText: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
