"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  unassignedProducts: ProductSimple[];
};

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Category[]>(categories);
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [dragOverSub, setDragOverSub] = useState<string | null>(null);

  // 分类排序状态
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const router = useRouter();

  // 服务端刷新后同步顺序
  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const selected = items.find((c) => c.id === selectedId);

  // 保存顺序：乐观更新，失败回滚并刷新服务端数据
  const persistOrder = async (next: Category[]) => {
    const prev = items;
    setItems(next);
    setSaving(true);
    try {
      const res = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || String(res.status));
      }
    } catch (e) {
      console.error(e);
      setItems(prev);
      alert("顺序保存失败，请重试");
    } finally {
      setSaving(false);
      router.refresh();
    }
  };

  // 上移 / 下移
  const moveBy = (id: string, delta: number) => {
    if (saving) return;
    const arr = [...items];
    const idx = arr.findIndex((c) => c.id === id);
    const target = idx + delta;
    if (idx < 0 || target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    void persistOrder(arr);
  };

  // 拖动排序
  const onCategoryDragStart = (e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "CATEGORY:" + id);
  };

  const onCategoryDragOver = (e: React.DragEvent, id: string) => {
    if (!dragIdRef.current || dragIdRef.current === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    setDropTarget({ id, after });
  };

  const onCategoryDragLeave = (e: React.DragEvent, id: string) => {
    // 在子元素之间移动会触发 dragleave，用 relatedTarget 过滤掉
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDropTarget((cur) => (cur?.id === id ? null : cur));
  };

  const onCategoryDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const draggedId = dragIdRef.current;
    dragIdRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
    if (!draggedId || draggedId === id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;

    const arr = [...items];
    const from = arr.findIndex((c) => c.id === draggedId);
    if (from === -1) return;
    const [moved] = arr.splice(from, 1);
    const to = arr.findIndex((c) => c.id === id);
    if (to === -1) return;
    arr.splice(after ? to + 1 : to, 0, moved);

    void persistOrder(arr);
  };

  const onCategoryDragEnd = () => {
    dragIdRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  };

  // 拖动产品到目标分类，成功后刷新服务端数据
  const moveProduct = async (productId: string, subCategoryId: string | null, categoryId?: string) => {
    try {
      const res = await fetch("/api/products/move-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, subCategoryId, categoryId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        alert("移动失败：" + (data?.error || res.status));
      }
    } catch (e) {
      console.error(e);
      alert("移动失败，请重试");
    }
  };

  const onDropProduct = (e: React.DragEvent, subCategoryId: string | null, categoryId?: string) => {
    e.preventDefault();
    setDragOverSub(null);
    const raw = e.dataTransfer.getData("text/plain");
    // 分类排序拖动不应触发产品移动
    if (!raw || raw.startsWith("CATEGORY:")) return;
    moveProduct(raw, subCategoryId, categoryId);
  };

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
      {/* 左侧：一级分类导航（可拖动 / 上下移动调整顺序） */}
      <aside className="category-sidebar">
        <div
          className="sidebar-banner"
          style={{
            backgroundImage: selected?.bannerImage
              ? `url("${selected.bannerImage}")`
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
          <div className="sidebar-header-right">
            {saving ? (
              <span className="sidebar-saving">保存中…</span>
            ) : (
              <span className="sidebar-sort-hint">拖动排序</span>
            )}
            <span className="sidebar-total">{items.length}</span>
          </div>
        </div>
        <div className="sidebar-list">
          {items.map((cat, i) => (
            <div
              key={cat.id}
              className={`sidebar-item ${selectedId === cat.id ? "active" : ""} ${
                draggingId === cat.id ? "dragging" : ""
              } ${
                dropTarget?.id === cat.id
                  ? dropTarget.after
                    ? "drag-over-after"
                    : "drag-over-before"
                  : ""
              }`}
              onClick={() => setSelectedId(cat.id)}
              draggable={!saving}
              onDragStart={(e) => onCategoryDragStart(e, cat.id)}
              onDragOver={(e) => onCategoryDragOver(e, cat.id)}
              onDragLeave={(e) => onCategoryDragLeave(e, cat.id)}
              onDrop={(e) => onCategoryDrop(e, cat.id)}
              onDragEnd={onCategoryDragEnd}
            >
              <span className="sidebar-badge" title="拖动可调整顺序">
                {String(i + 1).padStart(2, "0")}
              </span>
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
              <div className="sidebar-item-actions">
                <button
                  type="button"
                  className="sidebar-move-btn"
                  title="上移"
                  aria-label={`上移 ${cat.name}`}
                  disabled={i === 0 || saving}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBy(cat.id, -1);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="sidebar-move-btn"
                  title="下移"
                  aria-label={`下移 ${cat.name}`}
                  disabled={i === items.length - 1 || saving}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBy(cat.id, 1);
                  }}
                >
                  ↓
                </button>
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

            {/* 直接挂在一级分类下的产品（没有二级分类） */}
            {selected.unassignedProducts.length > 0 && (
              <div className="sub-category-panel">
                <div className="panel-header">
                  <h3>直接分类产品（未分配二级分类）</h3>
                  <span className="panel-hint">{selected.unassignedProducts.length} 个产品</span>
                </div>
                <div
                  className={`accordion-content ${dragOverSub === "__unassigned__" ? "drag-over" : ""}`}
                  style={{ padding: "16px" }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSub("__unassigned__");
                  }}
                  onDragLeave={() => setDragOverSub((cur) => (cur === "__unassigned__" ? null : cur))}
                  onDrop={(e) => onDropProduct(e, null, selected.id)}
                >
                  <div className="accordion-product-tags">
                    {selected.unassignedProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}/edit`}
                        className="product-tag-item"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", p.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                        className={`accordion-header ${dragOverSub === sub.id ? "drag-over" : ""}`}
                        onClick={() => toggleSub(sub.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverSub(sub.id);
                        }}
                        onDragLeave={() => setDragOverSub((cur) => (cur === sub.id ? null : cur))}
                        onDrop={(e) => onDropProduct(e, sub.id)}
                      >
                        <span className="accordion-arrow">
                          {expandedSubs.has(sub.id) ? "▼" : "▶"}
                        </span>
                        <span className="accordion-name">{sub.name}</span>
                        <span className="accordion-count">{sub.products.length} 个产品</span>
                      </div>
                      {expandedSubs.has(sub.id) && (
                        <div
                          className={`accordion-content ${dragOverSub === sub.id ? "drag-over" : ""}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverSub(sub.id);
                          }}
                          onDragLeave={() => setDragOverSub((cur) => (cur === sub.id ? null : cur))}
                          onDrop={(e) => onDropProduct(e, sub.id)}
                        >
                          {sub.products.length === 0 ? (
                            <p className="accordion-empty">该分类下暂无产品（可拖入产品到此）</p>
                          ) : (
                            <div className="accordion-product-tags">
                              {sub.products.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/admin/products/${p.id}/edit`}
                                  className="product-tag-item"
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", p.id);
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
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
