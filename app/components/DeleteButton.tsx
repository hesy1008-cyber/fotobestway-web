"use client";

export default function DeleteButton() {
  return (
    <button
      type="submit"
      className="admin-btn admin-btn-danger admin-btn-sm"
      onClick={(e) => {
        const result = window.confirm(
          "确定删除此产品及所有图片吗？此操作不可撤销。"
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
