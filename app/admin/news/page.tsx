import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import DeleteNewsButton from "./DeleteNewsButton";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const newsList = await prisma.news.findMany({
    orderBy: [{ sortOrder: "asc" }, { publishDate: "desc" }],
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">新闻管理</h1>
          <p className="admin-page-subtitle">
            管理网站新闻资讯（共 {newsList.length} 篇）
          </p>
        </div>
        <Link href="/admin/news/new" className="admin-btn admin-btn-primary">
          + 新增新闻
        </Link>
      </div>

      <div className="admin-list">
        {newsList.map((news) => (
          <div key={news.id} className="admin-card" style={{ alignItems: "flex-start" }}>
            {news.coverImage && (
              <div
                className="admin-card-image"
                style={{ width: "160px", height: "100px", flexShrink: 0 }}
              >
                <Image
                  src={news.coverImage}
                  alt={news.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            <div className="admin-card-info" style={{ flex: 1 }}>
              <h3 className="admin-card-title" style={{ marginBottom: "8px" }}>
                {news.title}
                {!news.isActive && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "11px",
                      background: "#ff9800",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "500",
                    }}
                  >
                    草稿
                  </span>
                )}
              </h3>
              <div className="admin-card-meta" style={{ gap: "16px" }}>
                <span>分类：{news.category}</span>
                <span>标识：{news.slug}</span>
                <span>
                  发布：{new Date(news.publishDate).toLocaleDateString("zh-CN")}
                </span>
              </div>
              {news.summary && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#666",
                    lineHeight: "1.6",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {news.summary}
                </p>
              )}
            </div>

            <div className="admin-card-actions" style={{ flexShrink: 0 }}>
              <Link
                href={`/news/${news.slug}`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                target="_blank"
              >
                查看
              </Link>
              <Link
                href={`/admin/news/${news.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                编辑
              </Link>
              <DeleteNewsButton id={news.id} />
            </div>
          </div>
        ))}

        {newsList.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            暂无新闻，点击右上角"新增新闻"开始创建
          </div>
        )}
      </div>
    </div>
  );
}
