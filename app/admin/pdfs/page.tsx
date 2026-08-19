import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import DeletePdfButton from "./DeletePdfButton";
import { deletePdf } from "./actions";

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function AdminPdfsPage() {
  // 从数据库读取分类
  const categories = await prisma.pdfCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { files: true },
      },
    },
  });

  const pdfs = await prisma.pdfFile.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      category: true,
    },
  });

  // 按分类分组
  const groupedPdfs = pdfs.reduce((acc, pdf) => {
    const key = pdf.categoryId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pdf);
    return acc;
  }, {} as Record<string, typeof pdfs>);

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">PDF 文件上传</h1>
          <p className="admin-page-subtitle">
            管理 Support 页面下载中心的分类模块（共 {pdfs.length} 个文件，{categories.length} 个分类）
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/admin/pdf-categories"
            className="admin-btn admin-btn-secondary"
          >
            ⚙ 管理分类
          </Link>
          <Link href="/admin/pdfs/new" className="admin-btn admin-btn-primary">
            + 上传 PDF
          </Link>
        </div>
      </div>

      {/* 分类卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
        {categories.map((category) => {
          const items = groupedPdfs[category.id] || [];
          return (
            <div
              key={category.id}
              style={{
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
                overflow: "hidden",
                opacity: category.isActive ? 1 : 0.6,
              }}
            >
              {/* 模块头部 */}
              <div
                style={{
                  padding: "24px",
                  borderBottom: "1px solid #eee",
                  background: "linear-gradient(135deg, #f8f9fa 0%, #fff 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#999", letterSpacing: "1px", marginBottom: "4px" }}>
                      {category.subtitle || category.slug.toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{category.icon || "📄"}</span>
                      {category.name}
                      {!category.isActive && (
                        <span style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          background: "#ffebee",
                          color: "#c62828",
                          borderRadius: "10px",
                          fontWeight: "600",
                        }}>
                          已禁用
                        </span>
                      )}
                    </h2>
                    <p style={{ fontSize: "13px", color: "#666", margin: "8px 0 0 0" }}>
                      {category.description || ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#e60012" }}>
                      {items.length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      个文件
                    </div>
                  </div>
                </div>

                {/* 模块上传按钮 */}
                <Link
                  href={`/admin/pdfs/new?category=${category.id}`}
                  className="admin-btn admin-btn-primary"
                  style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
                >
                  + 上传到 {category.name}
                </Link>
              </div>

              {/* 文件列表 */}
              <div style={{ padding: "16px" }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                    <p style={{ fontSize: "14px", margin: 0 }}>暂无文件</p>
                    <p style={{ fontSize: "12px", marginTop: "8px" }}>点击上方按钮上传</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {items.map((pdf) => (
                      <div
                        key={pdf.id}
                        style={{
                          padding: "12px",
                          border: "1px solid #eee",
                          borderRadius: "6px",
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {pdf.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                              {formatFileSize(pdf.fileSize)} · {pdf.isActive ? "已启用" : "已禁用"}
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                          <a
                            href={pdf.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "6px 10px" }}
                          >
                            预览
                          </a>
                          <Link
                            href={`/admin/pdfs/${pdf.id}/edit`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ flex: 1, justifyContent: "center", fontSize: "12px", padding: "6px 10px" }}
                          >
                            替换
                          </Link>
                          <form action={deletePdf} style={{ flex: 1 }}>
                            <input type="hidden" name="id" value={pdf.id} />
                            <DeletePdfButton style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "6px 10px" }} />
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div style={{ marginTop: "40px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 10px 0" }}>💡 使用说明</h3>
        <ul style={{ fontSize: "13px", color: "#666", margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
          <li>每个分类对应 Support 页面下载中心的一个模块</li>
          <li>点击右上角「管理分类」可以新增、编辑、删除分类</li>
          <li>点击「替换」可以更换 PDF 文件或修改标题、排序等</li>
          <li>禁用的分类和文件不会在前台显示</li>
          <li>文件大小建议控制在 20MB 以内</li>
        </ul>
      </div>
    </div>
  );
}
