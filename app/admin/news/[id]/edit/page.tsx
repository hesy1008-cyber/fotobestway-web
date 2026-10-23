import { prisma } from "@/app/lib/prisma";
import EditNewsForm, { type NewsItem } from "./EditNewsForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });

  if (!news) {
    notFound();
  }

  // 映射为组件需要的类型（类型安全，去掉 as any）
  const newsItem: NewsItem = {
    id: news.id,
    title: news.title,
    slug: news.slug,
    summary: news.summary,
    content: news.content,
    coverImage: news.coverImage,
    category: news.category,
    sortOrder: news.sortOrder,
    isActive: news.isActive,
    seoTitle: news.seoTitle,
    metaDescription: news.metaDescription,
    focusKeywords: news.focusKeywords,
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">编辑新闻</h1>
          <p className="admin-page-subtitle">修改新闻内容和设置</p>
        </div>
      </div>
      <div className="admin-form-container">
        <EditNewsForm news={newsItem} />
      </div>
    </div>
  );
}
