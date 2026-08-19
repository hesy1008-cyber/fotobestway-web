import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import InquiryList from "./InquiryList";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = inquiries.filter((i) => !i.isRead).length;

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            询盘{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#e63946",
                  color: "#fff",
                  fontSize: "14px",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  marginLeft: "8px",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} 未读
              </span>
            )}
          </h1>
          <p className="admin-page-subtitle">
            客户通过联系表单提交的询盘，共 {inquiries.length} 条
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin" className="admin-btn admin-btn-secondary">
            ← 返回控制台
          </Link>
        </div>
      </div>

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
    </div>
  );
}
