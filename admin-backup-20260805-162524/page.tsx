import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import InquiryList from "./inquiries/InquiryList";

export default async function AdminDashboard() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  // 计算总图片数（估算）
  const products = await prisma.product.findMany({
    select: { gallery: true, detailImages: true },
  });
  const totalImages = products.reduce((sum, p) => {
    return (
      sum +
      (Array.isArray(p.gallery) ? p.gallery.length : 0) +
      (Array.isArray(p.detailImages) ? p.detailImages.length : 0) +
      1 // 主图
    );
  }, 0);

  // 询盘数据
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const unreadCount = await prisma.inquiry.count({
    where: { isRead: false },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Quick overview of your store and shortcuts to common actions.
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + Add Product
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Products</div>
          <div className="admin-stat-value red">{productCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Categories</div>
          <div className="admin-stat-value">{categoryCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Images</div>
          <div className="admin-stat-value">{totalImages}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">待处理询盘</div>
          <div className="admin-stat-value red">{unreadCount}</div>
        </div>
      </div>

      {/* 客户询盘 */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            margin: "0 0 20px",
            color: "#111",
          }}
        >
          客户询盘 Inquiries
          {unreadCount > 0 && (
            <span
              style={{
                background: "#e63946",
                color: "#fff",
                fontSize: "13px",
                padding: "2px 10px",
                borderRadius: "12px",
                marginLeft: "10px",
                verticalAlign: "middle",
              }}
            >
              {unreadCount} 未读
            </span>
          )}
        </h2>
        {inquiries.length > 0 ? (
          <InquiryList
            inquiries={inquiries.map((i) => ({
              id: i.id,
              name: i.name,
              email: i.email,
              company: i.company,
              phone: i.phone,
              subject: i.subject,
              message: i.message,
              isRead: i.isRead,
              createdAt: i.createdAt.toISOString(),
            }))}
          />
        ) : (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              padding: "40px",
              textAlign: "center",
              color: "#999",
            }}
          >
            还没有收到客户询盘
          </div>
        )}
      </div>

      {/* 快捷操作 + 分类概览 两栏布局 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginBottom: "40px",
        }}
      >
        {/* 快捷操作 */}
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: "0 0 20px",
              color: "#111",
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Link
              href="/admin/products/new"
              className="admin-btn admin-btn-primary"
              style={{ justifyContent: "center" }}
            >
              + New Product
            </Link>
            <Link
              href="/admin/categories/new"
              className="admin-btn admin-btn-secondary"
              style={{ justifyContent: "center" }}
            >
              + New Category
            </Link>
            <Link
              href="/admin/products"
              className="admin-btn admin-btn-secondary"
              style={{ justifyContent: "center" }}
            >
              All Products
            </Link>
            <Link
              href="/admin/categories"
              className="admin-btn admin-btn-secondary"
              style={{ justifyContent: "center" }}
            >
              All Categories
            </Link>
            <Link
              href="/"
              className="admin-btn admin-btn-secondary"
              style={{ justifyContent: "center", gridColumn: "span 2" }}
              target="_blank"
            >
              🔗 View Live Site
            </Link>
          </div>
        </div>

        {/* 分类概览 */}
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: "0 0 20px",
              color: "#111",
            }}
          >
            Categories Overview
          </h2>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom:
                    index < categories.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#999",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontWeight: 500, color: "#333" }}>
                    {cat.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e60012",
                    background: "#fef2f2",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    minWidth: "30px",
                    textAlign: "center",
                  }}
                >
                  {cat._count.products}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            margin: "0 0 20px",
            color: "#111",
          }}
        >
          System Info
        </h2>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
              Image Format
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
              WebP (Auto)
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
              Max Image Size
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
              1500 × 1500 px
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
              Auto Sizes
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
              3 sizes (thumb/medium/large)
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
              Auth Method
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
              HTTP Basic Auth
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
