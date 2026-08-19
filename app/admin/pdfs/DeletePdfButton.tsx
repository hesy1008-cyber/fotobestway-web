"use client";

interface DeletePdfButtonProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function DeletePdfButton({ style, className }: DeletePdfButtonProps) {
  return (
    <button
      type="submit"
      className={`admin-btn admin-btn-danger admin-btn-sm ${className || ""}`}
      style={style}
      onClick={(e) => {
        const result = window.confirm(
          "确定删除此 PDF 文件吗？此操作不可撤销。"
        );

        if (!result) {
          e.preventDefault();
        }
      }}
    >
      删除
    </button>
  );
}
