"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DeleteButton from "@/app/components/DeleteButton";
import { deleteProduct } from "../products/actions";

type CategorySimple = {
  id: string;
  name: string;
  slug: string;
  bannerImage?: string | null;
  products: { id: string }[];
};

type ProductSimple = {
  id: string;
  title: string;
  slug: string;
  image: string;
  categoryId: string | null;
  categoryRef?: { name: string } | null;
  gallery?: string[] | null;
  detailImages?: string[] | null;
};

export default function ProductManager({
  products,
  categories,
}: {
  products: ProductSimple[];
  categories: CategorySimple[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // 导出产品图片（主图+详情图）为ZIP
  const handleExportProduct = async (product: ProductSimple) => {
    setExportingId(product.id);
    try {
      const zip = new JSZip();
      const folderName = product.slug || product.title.replace(/\s+/g, "-").toLowerCase();
      const productFolder = zip.folder(folderName);

      if (!productFolder) throw new Error("创建ZIP文件夹失败");

      // 收集所有需要导出的图片
      const imagesToExport: { url: string; filename: string }[] = [];

      // 主图
      if (product.image) {
        const ext = product.image.split(".").pop()?.split("?")[0] || "jpg";
        imagesToExport.push({ url: product.image, filename: `main.${ext}` });
      }

      // 详情图
      if (Array.isArray(product.detailImages) && product.detailImages.length > 0) {
        product.detailImages.forEach((imgUrl, index) => {
          const ext = imgUrl.split(".").pop()?.split("?")[0] || "jpg";
          imagesToExport.push({ url: imgUrl, filename: `detail-${index + 1}.${ext}` });
        });
      }

      // 下载每张图片并添加到ZIP
      for (const img of imagesToExport) {
        try {
          const response = await fetch(img.url);
          if (!response.ok) throw new Error(`下载失败: ${img.url}`);
          const blob = await response.blob();
          productFolder.file(img.filename, blob);
        } catch (err) {
          console.error(`下载图片失败: ${img.url}`, err);
        }
      }

      // 生成ZIP并下载
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    } finally {
      setExportingId(null);
    }
  };

  // 筛选产品
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 分类筛选
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) {
        return false;
      }
      // 搜索筛选
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          (p.categoryRef?.name || "").toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="product-manager">
      {/* 左侧：分类导航 */}
      <aside className="product-sidebar">
        <div
          className="product-sidebar-banner"
          style={{
            backgroundImage: selectedCategory?.bannerImage
              ? `url(${selectedCategory.bannerImage})`
              : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        >
          <div className="product-sidebar-banner-overlay"></div>
          <div className="product-sidebar-banner-content">
            <span className="product-sidebar-banner-label">
              {selectedCategory ? "当前分类" : "全部产品"}
            </span>
            <h2 className="product-sidebar-banner-title">
              {selectedCategory?.name || "所有产品"}
            </h2>
            <div className="product-sidebar-banner-stats">
              <span>{filteredProducts.length} 个产品</span>
            </div>
          </div>
        </div>

        <div className="product-sidebar-list-header">
          <span>按分类筛选</span>
        </div>

        <div className="product-sidebar-list">
          <div
            className={`product-sidebar-item ${selectedCategoryId === "" ? "active" : ""}`}
            onClick={() => setSelectedCategoryId("")}
          >
            <span className="product-sidebar-item-name">全部产品</span>
            <span className="product-sidebar-item-count">{products.length}</span>
          </div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`product-sidebar-item ${selectedCategoryId === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <span className="product-sidebar-item-name">{cat.name}</span>
              <span className="product-sidebar-item-count">{cat.products.length}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* 右侧：搜索框 + 产品列表 */}
      <main className="product-detail-panel">
        {/* 顶部搜索框 */}
        <div className="product-search-bar">
          <div className="product-search-input-wrapper">
            <svg
              className="product-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="product-search-input"
              placeholder="搜索产品名称、标识或分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="product-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <div className="product-search-result-count">
            共 <strong>{filteredProducts.length}</strong> 个产品
          </div>
        </div>

        {/* 产品列表 */}
        <div className="admin-list">
          {filteredProducts.length === 0 ? (
            <div className="product-empty">
              <p>没有找到匹配的产品</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="admin-card">
                {product.image && (
                  <div className="admin-card-image">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                )}

                <div className="admin-card-info">
                  <h3 className="admin-card-title">{product.title}</h3>
                  <div className="admin-card-meta">
                    <span>分类：{product.categoryRef?.name || "未分类"}</span>
                    <span>产品名称：{product.slug}</span>
                    <span>
                      图集：{Array.isArray(product.gallery) ? product.gallery.length : 0} 张
                    </span>
                    <span>
                      详情图：
                      {Array.isArray(product.detailImages) ? product.detailImages.length : 0} 张
                    </span>
                  </div>
                </div>

                <div className="admin-card-actions">
                  <button
                    onClick={() => handleExportProduct(product)}
                    disabled={exportingId === product.id}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    style={{
                      background: exportingId === product.id ? "#ccc" : "#2196f3",
                      color: "#fff",
                      border: "none",
                      cursor: exportingId === product.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {exportingId === product.id ? "导出中..." : "导出图片"}
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    编辑
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    target="_blank"
                  >
                    查看
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <DeleteButton />
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
