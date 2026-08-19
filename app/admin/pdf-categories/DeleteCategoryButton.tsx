"use client";

interface DeleteCategoryButtonProps {
  categoryName: string;
  fileCount: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function DeleteCategoryButton({
  categoryName,
  fileCount,
  style,
  className,
}: DeleteCategoryButtonProps) {
  return (
    <button
      type="submit"
      className={`admin-btn admin-btn-danger admin-btn-sm ${className || ""}`}
      style={{
        background: "transparent",
        color: "#e53935",
        border: "1px solid #ef9a9a",
        ...style,
      }}
      onClick={(e) => {
        const result = window.confirm(
          `确定要删除分类「${categoryName}」吗？\n分类下有 ${fileCount} 个文件，删除前请确保文件已移走。`
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
