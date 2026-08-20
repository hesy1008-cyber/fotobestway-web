"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteCategoryButton from "./DeleteCategoryButton";

type ProductSimple = { id: string; title: string };
type SubCategory = {
  id: string;
  name: string;
  slug: string;
  products: ProductSimple[];
};
type Category = {
  id: string;
  name: string;
  slug: string;
  bannerImage?: string | null;
  products: { id: string }[];
  subCategories: SubCategory[];
};

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const selected = categories.find((c) => c.id === selectedId);

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="category-manager">
      {/* 左侧：一级分类导航 */}
      <aside className="category-sidebar">
        <div
          className="sidebar-banner"
          style={{
            backgroundImage: selected?.bannerImage
              ? `url(${selected.bannerImage})`
              : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        >
          <div className="sidebar-banner-overlay"></div>
          <div className="sidebar-banner-content">
            <span className="sidebar-banner-label">当前分类</span>
            <h2 className="sidebar-banner-title">{selected?.name || "分类导航"}</h2>
            <div className="sidebar-banner-stats">
              <span>{selected?.products.length || 0} 产品</span>
              <span className="sidebar-banner-dot">·</span>
              <span>{selected?.subCategories.length || 0} 子分类</span>
            </div>
          </div>
        </div>
        <div className="sidebar-list-header">
          <span>全部分类</span>
          <span className="sidebar-total">{categories.length}</span>
        </div>
        <div className="sidebar-list">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`sidebar-item ${selectedId === cat.id ? "active" : ""}`}
              onClick={() => setSelectedId(cat.id)}
            >
              <span className="sidebar-badge">{String(i + 1).padStart(2, "0")}</span>
              <span className="sidebar-name">{cat.name}</span>
              <div className="sidebar-item-stats">
                <span className="sidebar-stat">
                  <span className="sidebar-stat-num">{cat.products.length}</span>
                  <span className="sidebar-stat-label">产品</span>
                </span>
                <span className="sidebar-stat-divider"></span>
                <span className="sidebar-stat">
                  <span className="sidebar-stat-num">{cat.subCategories.length}</span>
                  <span className="sidebar-stat-label">子分类</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 右侧：分类详情 */}
      <main className="category-detail-panel">
        {selected && (
          <>
            {/* 顶部：标题 + 三个按钮 */}
            <div className="detail-top-bar">
              <div className="detail-title-area">
                <h1 className="detail-title">{selected.name}</h1>
                <span className="detail-slug">/{selected.slug}</span>
              </div>
              <div className="detail-action-buttons">
                <Link
                  href={`/admin/categories/${selected.id}/sub-categories`}
                  className="detail-btn detail-btn-primary"
                >
                  子分类
                </Link>
                <Link
                  href={`/admin/categories/${selected.id}/edit`}
                  className="detail-btn detail-btn-secondary"
                >
                  编辑
                </Link>
                <DeleteCategoryButton id={selected.id} />
              </div>
            </div>

            {/* 二级分类列表（可展开看产品） */}
            <div className="sub-category-panel">
              <div className="panel-header">
                <h3>二级分类列表</h3>
                <span className="panel-hint">点击展开查看产品</span>
              </div>
              <div className="sub-category-accordion">
                {selected.subCategories.length === 0 ? (
                  <div className="empty-sub">暂无二级分类</div>
                ) : (
                  selected.subCategories.map((sub) => (
                    <div key={sub.id} className="accordion-item">
                      <div
                        className="accordion-header"
                        onClick={() => toggleSub(sub.id)}
                      >
                        <span className="accordion-arrow">
                          {expandedSubs.has(sub.id) ? "▼" : "▶"}
                        </span>
                        <span className="accordion-name">{sub.name}</span>
                        <span className="accordion-count">{sub.products.length} 个产品</span>
                      </div>
                      {expandedSubs.has(sub.id) && (
                        <div className="accordion-content">
                          {sub.products.length === 0 ? (
                            <p className="accordion-empty">该分类下暂无产品</p>
                          ) : (
                            <div className="accordion-product-tags">
                              {sub.products.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/admin/products/${p.id}/edit`}
                                  className="product-tag-item"
                                >
                                  {p.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
