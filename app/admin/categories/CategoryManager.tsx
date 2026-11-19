"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteCategoryButton from "./DeleteCategoryButton";
import { findDropBeforeId } from "./productDropTarget";

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

type DragState =
  | { kind: "category"; id: string }
  | { kind: "sub"; id: string; categoryId: string }
  | { kind: "product"; id: string; categoryId: string; subCategoryId: string | null };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Category[]>(categories);
  const [selectedId, setSelectedId] = useState(categories[0]?.id || "");
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  // 产品拖拽落点：groupKey + 插入到哪个产品之前（null = 末尾）
  const [productDrop, setProductDrop] = useState<{
    groupKey: string;
    beforeId: string | null;
  } | null>(null);

  // 分类排序状态
  const [savingCategory, setSavingCategory] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);

  // 二级分类 / 产品排序状态
  const [savingList, setSavingList] = useState(false);
  const [draggingSubId, setDraggingSubId] = useState<string | null>(null);
  const [subDropTarget, setSubDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);

  const dragRef = useRef<DragState | null>(null);

  const router = useRouter();

  // 服务端刷新后同步顺序
  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const selected = items.find((c) => c.id === selectedId);

  const saving = savingCategory || savingList;

  /* ===================== 一级分类排序 ===================== */

  const persistOrder = async (next: Category[]) => {
    const prev = items;
    setItems(next);
    setSavingCategory(true);
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
      setSavingCategory(false);
      router.refresh();
    }
  };

  const moveBy = (id: string, delta: number) => {
    if (saving) return;
    const arr = [...items];
    const idx = arr.findIndex((c) => c.id === id);
    const target = idx + delta;
    if (idx < 0 || target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    void persistOrder(arr);
  };

  const onCategoryDragStart = (e: React.DragEvent, id: string) => {
    dragRef.current = { kind: "category", id };
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "CATEGORY:" + id);
  };

  const onCategoryDragOver = (e: React.DragEvent, id: string) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "category" || drag.id === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    setDropTarget({ id, after });
  };

  const onCategoryDragLeave = (e: React.DragEvent, id: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDropTarget((cur) => (cur?.id === id ? null : cur));
  };

  const onCategoryDrop = (e: React.DragEvent, id: string) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "category") return;
    e.preventDefault();
    dragRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
    if (drag.id === id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;

    const arr = [...items];
    const from = arr.findIndex((c) => c.id === drag.id);
    if (from === -1) return;
    const [moved] = arr.splice(from, 1);
    const to = arr.findIndex((c) => c.id === id);
    if (to === -1) return;
    arr.splice(after ? to + 1 : to, 0, moved);

    void persistOrder(arr);
  };

  const onCategoryDragEnd = () => {
    dragRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  };

  /* ===================== 数据分组读写 ===================== */

  const getGroupProducts = (categoryId: string, subCategoryId: string | null, source?: Category[]) => {
    const list = source || items;
    const cat = list.find((c) => c.id === categoryId);
    if (!cat) return [] as ProductSimple[];
    if (subCategoryId === null) return cat.unassignedProducts;
    return cat.subCategories.find((s) => s.id === subCategoryId)?.products || [];
  };

  const setGroupProducts = (
    categoryId: string,
    subCategoryId: string | null,
    next: ProductSimple[]
  ) => {
    setItems((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        if (subCategoryId === null) {
          return { ...cat, unassignedProducts: next };
        }
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id === subCategoryId ? { ...sub, products: next } : sub
          ),
        };
      })
    );
  };

  /* ===================== 二级分类排序 ===================== */

  const persistSubOrder = async (categoryId: string, nextSubs: SubCategory[], prevSubs: SubCategory[]) => {
    setItems((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, subCategories: nextSubs } : cat
      )
    );
    setSavingList(true);
    try {
      const res = await fetch("/api/subcategories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, ids: nextSubs.map((s) => s.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || String(res.status));
      }
    } catch (e) {
      console.error(e);
      setItems((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, subCategories: prevSubs } : cat
        )
      );
      alert("二级分类顺序保存失败，请重试");
    } finally {
      setSavingList(false);
      router.refresh();
    }
  };

  const onSubDragStart = (e: React.DragEvent, categoryId: string, subId: string) => {
    dragRef.current = { kind: "sub", id: subId, categoryId };
    setDraggingSubId(subId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "SUB:" + subId);
  };

  const onSubDragEnd = () => {
    dragRef.current = null;
    setDraggingSubId(null);
    setSubDropTarget(null);
  };

  const onSubDragOver = (e: React.DragEvent, subId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "sub" || drag.id === subId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    setSubDropTarget({ id: subId, after: e.clientY - rect.top > rect.height / 2 });
  };

  const onSubDrop = (e: React.DragEvent, categoryId: string, subId: string) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "sub") return;
    e.preventDefault();
    dragRef.current = null;
    setDraggingSubId(null);
    setSubDropTarget(null);

    if (drag.categoryId !== categoryId || drag.id === subId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;

    const cat = items.find((c) => c.id === categoryId);
    if (!cat) return;
    const arr = [...cat.subCategories];
    const from = arr.findIndex((s) => s.id === drag.id);
    if (from === -1) return;
    const [moved] = arr.splice(from, 1);
    const to = arr.findIndex((s) => s.id === subId);
    if (to === -1) return;
    arr.splice(after ? to + 1 : to, 0, moved);

    void persistSubOrder(categoryId, arr, cat.subCategories);
  };

  /* ===================== 产品移动 / 排序 ===================== */

  const moveProduct = async (productId: string, subCategoryId: string | null, categoryId: string) => {
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

  const persistProductOrder = async (
    categoryId: string,
    subCategoryId: string | null,
    next: ProductSimple[],
    prev: ProductSimple[]
  ) => {
    setGroupProducts(categoryId, subCategoryId, next);
    setSavingList(true);
    try {
      const res = await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: next.map((p) => p.id),
          categoryId,
          subCategoryId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || String(res.status));
      }
    } catch (e) {
      console.error(e);
      setGroupProducts(categoryId, subCategoryId, prev);
      alert("产品顺序保存失败，请重试");
    } finally {
      setSavingList(false);
      router.refresh();
    }
  };

  const onProductDragStart = (
    e: React.DragEvent,
    categoryId: string,
    subCategoryId: string | null,
    productId: string
  ) => {
    dragRef.current = { kind: "product", id: productId, categoryId, subCategoryId };
    setDraggingProductId(productId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "PRODUCT:" + productId);
  };

  const onProductDragEnd = () => {
    dragRef.current = null;
    setDraggingProductId(null);
    setDragOverGroup(null);
    setProductDrop(null);
  };

  const onGroupDragOver = (e: React.DragEvent, groupKey: string) => {
    if (dragRef.current?.kind !== "product") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroup(groupKey);
    const beforeId = findDropBeforeId(
      e.currentTarget as HTMLElement,
      e.clientX,
      e.clientY,
      dragRef.current.id
    );
    setProductDrop((cur) =>
      cur && cur.groupKey === groupKey && cur.beforeId === beforeId
        ? cur
        : { groupKey, beforeId }
    );
  };

  const onGroupDragLeave = (e: React.DragEvent, groupKey: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragOverGroup((cur) => (cur === groupKey ? null : cur));
    setProductDrop((cur) => (cur && cur.groupKey === groupKey ? null : cur));
  };

  const onGroupDrop = (
    e: React.DragEvent,
    categoryId: string,
    subCategoryId: string | null,
    groupKey: string
  ) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();

    const beforeId =
      drag.kind === "product"
        ? findDropBeforeId(
            e.currentTarget as HTMLElement,
            e.clientX,
            e.clientY,
            drag.id
          )
        : null;

    setDragOverGroup(null);
    setProductDrop(null);
    dragRef.current = null;
    setDraggingProductId(null);

    // 二级分类拖动由各自的 handler 处理，这里只处理产品
    if (drag.kind !== "product") return;

    const sameGroup = drag.categoryId === categoryId && drag.subCategoryId === subCategoryId;

    if (!sameGroup) {
      // 跨分组 = 移动产品到目标分类，追加到末尾
      void moveProduct(drag.id, subCategoryId, categoryId);
      return;
    }

    const current = getGroupProducts(categoryId, subCategoryId);
    if (current.length === 0) return;

    const moved = current.find((p) => p.id === drag.id);
    if (!moved) return;
    const without = current.filter((p) => p.id !== drag.id);
    const insertAt = beforeId ? without.findIndex((p) => p.id === beforeId) : -1;
    const next = [...without];
    if (insertAt >= 0) next.splice(insertAt, 0, moved);
    else next.push(moved);

    const unchanged = next.every((p, i) => p.id === current[i]?.id);
    if (unchanged) return;

    void persistProductOrder(categoryId, subCategoryId, next, current);
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
                  <span className="panel-hint">
                    拖动产品可调整顺序（{selected.unassignedProducts.length} 个）
                  </span>
                </div>
                <div
                  className={`accordion-content ${
                    dragOverGroup === "__unassigned__" ? "drag-over" : ""
                  }`}
                  style={{ padding: "16px" }}
                  onDragOver={(e) => onGroupDragOver(e, "__unassigned__")}
                  onDragLeave={(e) => onGroupDragLeave(e, "__unassigned__")}
                  onDrop={(e) => onGroupDrop(e, selected.id, null, "__unassigned__")}
                >
                  <div className="accordion-product-tags">
                    {selected.unassignedProducts.map((p, idx, arr) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}/edit`}
                        data-product-id={p.id}
                        className={`product-tag-item ${
                          draggingProductId === p.id ? "dragging" : ""
                        } ${
                          productDrop?.groupKey === "__unassigned__" &&
                          productDrop.beforeId === p.id
                            ? "drop-before"
                            : ""
                        } ${
                          productDrop?.groupKey === "__unassigned__" &&
                          productDrop.beforeId === null &&
                          idx === arr.length - 1
                            ? "drop-end"
                            : ""
                        }`}
                        draggable={!saving}
                        onDragStart={(e) =>
                          onProductDragStart(e, selected.id, null, p.id)
                        }
                        onDragEnd={onProductDragEnd}
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
                <span className="panel-hint">
                  拖动左侧把手调整子分类顺序，拖动产品调整组内顺序
                </span>
              </div>
              <div className="sub-category-accordion">
                {selected.subCategories.length === 0 ? (
                  <div className="empty-sub">暂无二级分类</div>
                ) : (
                  selected.subCategories.map((sub) => {
                    const groupKey = "sub:" + sub.id;
                    return (
                      <div key={sub.id} className="accordion-item">
                        <div
                          className={`accordion-header ${
                            dragOverGroup === groupKey ? "drag-over" : ""
                          } ${draggingSubId === sub.id ? "dragging" : ""} ${
                            subDropTarget?.id === sub.id
                              ? subDropTarget.after
                                ? "drop-after"
                                : "drop-before"
                              : ""
                          }`}
                          onClick={() => toggleSub(sub.id)}
                          onDragOver={(e) => {
                            if (dragRef.current?.kind === "sub") {
                              onSubDragOver(e, sub.id);
                              return;
                            }
                            onGroupDragOver(e, groupKey);
                          }}
                          onDragLeave={(e) => {
                            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                            setDragOverGroup((cur) => (cur === groupKey ? null : cur));
                            setSubDropTarget((cur) => (cur?.id === sub.id ? null : cur));
                          }}
                          onDrop={(e) => {
                            if (dragRef.current?.kind === "sub") {
                              onSubDrop(e, selected.id, sub.id);
                              return;
                            }
                            onGroupDrop(e, selected.id, sub.id, groupKey);
                          }}
                        >
                          <span
                            className="accordion-grip"
                            title="拖动调整二级分类顺序"
                            draggable={!saving}
                            onClick={(e) => e.stopPropagation()}
                            onDragStart={(e) => onSubDragStart(e, selected.id, sub.id)}
                            onDragEnd={onSubDragEnd}
                          >
                            ⠿
                          </span>
                          <span className="accordion-arrow">
                            {expandedSubs.has(sub.id) ? "▼" : "▶"}
                          </span>
                          <span className="accordion-name">{sub.name}</span>
                          <span className="accordion-count">{sub.products.length} 个产品</span>
                        </div>
                        {expandedSubs.has(sub.id) && (
                          <div
                            className={`accordion-content ${
                              dragOverGroup === groupKey ? "drag-over" : ""
                            }`}
                            onDragOver={(e) => onGroupDragOver(e, groupKey)}
                            onDragLeave={(e) => onGroupDragLeave(e, groupKey)}
                            onDrop={(e) => onGroupDrop(e, selected.id, sub.id, groupKey)}
                          >
                            {sub.products.length === 0 ? (
                              <p className="accordion-empty">该分类下暂无产品（可拖入产品到此）</p>
                            ) : (
                              <div className="accordion-product-tags">
                                {sub.products.map((p, idx, arr) => (
                                  <Link
                                    key={p.id}
                                    href={`/admin/products/${p.id}/edit`}
                                    data-product-id={p.id}
                                    className={`product-tag-item ${
                                      draggingProductId === p.id ? "dragging" : ""
                                    } ${
                                      productDrop?.groupKey === groupKey &&
                                      productDrop.beforeId === p.id
                                        ? "drop-before"
                                        : ""
                                    } ${
                                      productDrop?.groupKey === groupKey &&
                                      productDrop.beforeId === null &&
                                      idx === arr.length - 1
                                        ? "drop-end"
                                        : ""
                                    }`}
                                    draggable={!saving}
                                    onDragStart={(e) =>
                                      onProductDragStart(e, selected.id, sub.id, p.id)
                                    }
                                    onDragEnd={onProductDragEnd}
                                  >
                                    {p.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
