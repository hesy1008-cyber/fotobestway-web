"use client";

import { useState, useEffect, useRef } from "react";

type Block = {
  id: string;
  type: "text" | "image";
  content: string;
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// 简单 HTML 解析：<p> → 文字块，<img> → 图片块
function parseHtmlToBlocks(html: string): Block[] {
  if (!html || !html.trim()) {
    return [{ id: genId(), type: "text", content: "" }];
  }
  const blocks: Block[] = [];
  const regex = /<p[^>]*>([\s\S]*?)<\/p>|<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let lastIndex = 0;
  let textBuffer = "";
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      textBuffer += html.substring(lastIndex, match.index).replace(/<[^>]+>/g, "");
    }
    if (match[1] !== undefined) {
      textBuffer += match[1].replace(/<[^>]+>/g, "");
    } else if (match[2]) {
      if (textBuffer.trim()) {
        blocks.push({ id: genId(), type: "text", content: textBuffer.trim() });
        textBuffer = "";
      }
      blocks.push({ id: genId(), type: "image", content: match[2] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < html.length) {
    textBuffer += html.substring(lastIndex).replace(/<[^>]+>/g, "");
  }
  if (textBuffer.trim()) {
    blocks.push({ id: genId(), type: "text", content: textBuffer.trim() });
  }
  if (blocks.length === 0) {
    blocks.push({ id: genId(), type: "text", content: "" });
  }
  return blocks;
}

function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "image" && b.content) {
        return `<img src="${b.content}" alt="" style="width:100%;height:auto;display:block;margin:0 auto 24px;border-radius:6px;">`;
      }
      const lines = b.content
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      return lines.map((l) => `<p>${l}</p>`).join("\n");
    })
    .join("\n");
}

export default function NewsContentEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(value));
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingBlockIdRef = useRef<string | null>(null);
  const initialized = useRef(false);

  // 外部 value 变化时（如编辑页加载）同步
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    setBlocks(parseHtmlToBlocks(value));
  }, [value]);

  function updateBlocks(next: Block[]) {
    setBlocks(next);
    onChange(blocksToHtml(next));
  }

  function updateBlock(id: string, content: string) {
    const next = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    updateBlocks(next);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateBlocks(next);
  }

  function removeBlock(id: string) {
    if (blocks.length <= 1) {
      updateBlocks([{ id: genId(), type: "text", content: "" }]);
      return;
    }
    updateBlocks(blocks.filter((b) => b.id !== id));
  }

  function addBlock(type: "text" | "image") {
    const next = [...blocks, { id: genId(), type, content: "" }];
    updateBlocks(next);
  }

  async function uploadImageFile(file: File, blockId: string) {
    setUploadingId(blockId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/news", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        updateBlock(blockId, data.url);
      } else {
        alert("上传失败：" + (data.error || "未知错误"));
      }
    } catch (err) {
      alert("上传失败：" + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setUploadingId(null);
    }
  }
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, blockId: string) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await uploadImageFile(file, blockId);
  }

  function triggerUpload(blockId: string) {
    pendingBlockIdRef.current = blockId;
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const id = pendingBlockIdRef.current;
    if (id) handleImageUpload(e, id);
    pendingBlockIdRef.current = null;
  }

  const blockStyle: React.CSSProperties = {
    position: "relative",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "12px",
    background: "#fafafa",
  };

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "6px",
    marginBottom: "10px",
  };

  const toolBtnStyle: React.CSSProperties = {
    padding: "4px 10px",
    fontSize: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    color: "#666",
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {blocks.map((block, idx) => (
        <div key={block.id} style={blockStyle}>
          <div style={toolbarStyle}>
            <span style={{ fontSize: "11px", color: "#999", marginRight: "auto", alignSelf: "center" }}>
              {block.type === "text" ? "文字段落" : "图片"}
            </span>
            <button
              type="button"
              style={toolBtnStyle}
              onClick={() => moveBlock(block.id, -1)}
              disabled={idx === 0}
            >
              ↑
            </button>
            <button
              type="button"
              style={toolBtnStyle}
              onClick={() => moveBlock(block.id, 1)}
              disabled={idx === blocks.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              style={{ ...toolBtnStyle, color: "#e53935", borderColor: "#ffcdd2" }}
              onClick={() => removeBlock(block.id)}
            >
              删除
            </button>
          </div>

          {block.type === "text" ? (
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="输入文字内容，每行一个段落..."
              rows={Math.max(3, block.content.split("\n").length)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                lineHeight: "1.6",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) void uploadImageFile(file, block.id);
              }}
            >
              {block.content ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={block.content}
                    alt="news"
                    style={{ width: "100%", borderRadius: "6px", display: "block" }}
                  />
                  <button
                    type="button"
                    onClick={() => triggerUpload(block.id)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    更换图片
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerUpload(block.id)}
                  disabled={uploadingId === block.id}
                  style={{
                    width: "100%",
                    padding: "40px 20px",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    background: "#fff",
                    fontSize: "14px",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  {uploadingId === block.id ? "上传中..." : "点击或拖拽图片到此处上传"}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          type="button"
          onClick={() => addBlock("text")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fff",
            cursor: "pointer",
            color: "#555",
          }}
        >
          + 添加文字段落
        </button>
        <button
          type="button"
          onClick={() => addBlock("image")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fff",
            cursor: "pointer",
            color: "#555",
          }}
        >
          + 添加图片
        </button>
      </div>
    </div>
  );
}
