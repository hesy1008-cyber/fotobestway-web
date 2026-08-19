"use client";

import { useInquiryCart } from "@/app/contexts/InquiryCartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InquiryDrawer() {
  const { items, isOpen, openCart, closeCart, removeItem, updateQuantity, clearCart, itemCount } =
    useInquiryCart();
  const router = useRouter();

  const handleSubmitInquiry = () => {
    if (items.length === 0) return;

    // 生成产品列表参数
    const productList = items
      .map((item) => `${item.title} (Qty: ${item.quantity})`)
      .join(" | ");

    // 跳转到 contact 页面，带产品信息
    router.push(
      `/contact?inquiry=1&products=${encodeURIComponent(productList)}&count=${items.length}`
    );

    // 关闭侧边栏
    closeCart();
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div className="inquiry-overlay" onClick={closeCart} />
      )}

      {/* 侧边栏 */}
      <div className={`inquiry-drawer ${isOpen ? "open" : ""}`}>
        {/* 头部 */}
        <div className="inquiry-drawer-header">
          <h3>Inquiry List ({itemCount})</h3>
          <button className="inquiry-close-btn" onClick={closeCart} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 产品列表 */}
        <div className="inquiry-items">
          {items.length === 0 ? (
            <div className="inquiry-empty">
              <div className="inquiry-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 6h18" strokeLinecap="round" />
                  <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p>YOUR INQUIRY LIST IS EMPTY</p>
              <span>Add products to get started<br/>with your wholesale inquiry</span>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="inquiry-item">
                <Link href={`/products/${item.slug}`} className="inquiry-item-img" onClick={closeCart}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                </Link>
                <div className="inquiry-item-info">
                  <Link href={`/products/${item.slug}`} className="inquiry-item-title" onClick={closeCart}>
                    <h4>{item.title}</h4>
                  </Link>
                  <div className="inquiry-item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateQuantity(item.id, Math.max(1, val));
                      }}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="inquiry-item-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* 提交按钮 */}
        {items.length > 0 && (
          <div className="inquiry-footer">
            <div className="inquiry-summary">
              <span>{items.length} item{items.length > 1 ? "s" : ""} selected</span>
            </div>
            <button
              type="button"
              className="inquiry-submit-btn"
              onClick={handleSubmitInquiry}
            >
              CONTINUE TO INQUIRY →
            </button>
          </div>
        )}
      </div>

      {/* 悬浮按钮 */}
      {!isOpen && (
        <button className="inquiry-float-btn" onClick={openCart}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6h18" strokeLinecap="round" />
            <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {itemCount > 0 && <span className="inquiry-badge">{itemCount}</span>}
        </button>
      )}
    </>
  );
}
