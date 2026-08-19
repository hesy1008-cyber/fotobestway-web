"use client";

import { useState } from "react";
import { toggleInquiryRead, deleteInquiry } from "@/app/actions/inquiry";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const subjectLabels: Record<string, string> = {
  "product-inquiry": "Product Inquiry",
  "oem-odm": "OEM / ODM Service",
  "wholesale": "Wholesale / Distribution",
  "support": "Technical Support",
  "other": "Other",
};

export default function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleToggle(inq: Inquiry) {
    // 展开时自动标记已读
    if (expandedId === inq.id) {
      setExpandedId(null);
    } else {
      setExpandedId(inq.id);
      if (!inq.isRead) {
        await toggleInquiryRead(inq.id, true);
      }
    }
  }

  async function handleMarkUnread(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setPending(id);
    await toggleInquiryRead(id, false);
    setPending(null);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("确定要删除这条询盘吗？删除后无法恢复。")) return;
    setPending(id);
    await deleteInquiry(id);
    setPending(null);
  }

  if (inquiries.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#999",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
        <p style={{ fontSize: "16px", margin: 0 }}>还没有收到任何询盘</p>
        <p style={{ fontSize: "14px", color: "#bbb", marginTop: "8px" }}>
          客户在联系页面提交表单后，会显示在这里
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {inquiries.map((inq) => (
        <div
          key={inq.id}
          onClick={() => handleToggle(inq)}
          style={{
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            borderLeft: inq.isRead ? "4px solid #e0e0e0" : "4px solid #e63946",
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.2s ease",
          }}
        >
          {/* 头部行 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
              {!inq.isRead && (
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#e63946",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong style={{ fontSize: "15px", color: "#1a1a1a" }}>
                    {inq.name}
                  </strong>
                  {inq.company && (
                    <span style={{ fontSize: "13px", color: "#888" }}>
                      · {inq.company}
                    </span>
                  )}
                  {inq.subject && (
                    <span
                      style={{
                        fontSize: "12px",
                        background: "#f0f4ff",
                        color: "#3b5bdb",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {subjectLabels[inq.subject] || inq.subject}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginTop: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {inq.email} · {inq.message}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <span style={{ fontSize: "12px", color: "#aaa", whiteSpace: "nowrap" }}>
                {formatDate(inq.createdAt)}
              </span>
              <span style={{ fontSize: "12px", color: "#ccc" }}>
                {expandedId === inq.id ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {/* 展开详情 */}
          {expandedId === inq.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "0 20px 20px",
                borderTop: "1px solid #f0f0f0",
                cursor: "default",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  margin: "16px 0",
                }}
              >
                <InfoItem label="姓名" value={inq.name} />
                <InfoItem label="邮箱" value={inq.email} isEmail />
                <InfoItem label="公司" value={inq.company || "—"} />
                <InfoItem label="电话" value={inq.phone || "—"} />
                <InfoItem
                  label="主题"
                  value={inq.subject ? subjectLabels[inq.subject] || inq.subject : "—"}
                />
                <InfoItem label="提交时间" value={formatDate(inq.createdAt)} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
                  留言内容
                </div>
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    color: "#333",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {inq.message}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={`mailto:${inq.email}?subject=Re: Your inquiry to Fotobestway`}
                  className="admin-btn"
                  style={{
                    background: "#e63946",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  ✉️ 回复邮件
                </a>
                <button
                  onClick={(e) => handleMarkUnread(e, inq.id)}
                  disabled={pending === inq.id}
                  style={{
                    background: "#f1f3f5",
                    color: "#555",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  标为未读
                </button>
                <button
                  onClick={(e) => handleDelete(e, inq.id)}
                  disabled={pending === inq.id}
                  style={{
                    background: "#fff",
                    color: "#e63946",
                    border: "1px solid #e63946",
                    padding: "8px 18px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InfoItem({
  label,
  value,
  isEmail,
}: {
  label: string;
  value: string;
  isEmail?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
        {label}
      </div>
      {isEmail ? (
        <a
          href={`mailto:${value}`}
          style={{ fontSize: "14px", color: "#3b5bdb", textDecoration: "none" }}
        >
          {value}
        </a>
      ) : (
        <div style={{ fontSize: "14px", color: "#333" }}>{value}</div>
      )}
    </div>
  );
}
