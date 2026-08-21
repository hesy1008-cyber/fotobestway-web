"use client";

import { useState } from "react";
import { deleteNews } from "./actions";

export default function DeleteNewsButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定要删除这篇新闻吗？此操作不可撤销。")) {
      return;
    }
    setLoading(true);
    try {
      await deleteNews(id);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Delete failed:", error);
      alert("删除失败");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="admin-btn admin-btn-danger admin-btn-sm"
      style={{ background: "#e53935", color: "#fff", border: "none" }}
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
