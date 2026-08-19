import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { deletePdfCategory } from "./actions";
import DeleteCategoryButton from "./DeleteCategoryButton";

export default async function AdminPdfCategoriesPage() {
  const categories = await prisma.pdfCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { files: true },
      },
    },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">PDF 分类管理</h1>
          <p className="admin-page-subtitle">
            管理下载中心的分类模块，支持增删改（共 {categories.length} 个分类）
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/pdfs" className="admin-btn admin-btn-secondary">
            ← 返回 PDF 管理
          </Link>
          <Link
            href="/admin/pdf-categories/new"
            className="admin-btn admin-btn-primary"
          >
            + 新增分类
          </Link>
        </div>
      </div>

      {/* 分类列表 */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                排序
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                图标
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                名称
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                标识 (slug)
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                副标题
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                文件数
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                状态
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "14px 20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                  letterSpacing: "0.5px",
                }}
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                style={{ borderBottom: "1px solid #f0f0f0" }}
              >
                <td
                  style={{
                    padding: "14px 20px",
                    fontSize: "14px",
                    color: "#999",
                  }}
                >
                  {cat.sortOrder}
                </td>
                <td style={{ padding: "14px 20px", fontSize: "20px" }}>
                  {cat.icon || "📄"}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  {cat.name}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: "#666",
                    fontFamily: "monospace",
                  }}
                >
                  {cat.slug}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    fontSize: "12px",
                    color: "#999",
                  }}
                >
                  {cat.subtitle || "-"}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#e60012",
                    textAlign: "center",
                  }}
                >
                  {cat._count.files}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: cat.isActive ? "#e8f5e9" : "#ffebee",
                      color: cat.isActive ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {cat.isActive ? "启用" : "禁用"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    textAlign: "right",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <Link
                      href={`/admin/pdf-categories/${cat.id}/edit`}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                    >
                      编辑
                    </Link>
                    <form action={deletePdfCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <DeleteCategoryButton
                        categoryName={cat.name}
                        fileCount={cat._count.files}
                      />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#999",
            }}
          >
            <p style={{ fontSize: "14px", margin: 0 }}>暂无分类</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              点击右上角「新增分类」按钮创建
            </p>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 10px 0" }}>
          💡 使用说明
        </h3>
        <ul
          style={{
            fontSize: "13px",
            color: "#666",
            margin: 0,
            paddingLeft: "20px",
            lineHeight: "1.8",
          }}
        >
          <li>分类名称、副标题、图标都会在前台 Support 页面下载中心显示</li>
          <li>排序数字越小越靠前，建议用 1、2、3... 依次排列</li>
          <li>禁用的分类不会在前台显示，但后台仍可管理</li>
          <li>删除分类前请确保该分类下的文件已全部移走或删除</li>
          <li>slug 是分类的唯一标识，修改后会影响 URL，建议谨慎修改</li>
        </ul>
      </div>
    </div>
  );
}
