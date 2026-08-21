import { prisma } from "@/app/lib/prisma";
import EditNewsForm from "./EditNewsForm";
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

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">编辑新闻</h1>
          <p className="admin-page-subtitle">修改新闻内容和设置</p>
        </div>
      </div>
      <div className="admin-form-container">
        <EditNewsForm news={news as any} />
      </div>
    </div>
  );
}
