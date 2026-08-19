"use client";

import { deleteSubCategory } from "./sub-category-actions";

export default function DeleteSubCategoryButton({
  id,
  categoryId,
}: {
  id: string;
  categoryId: string;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const ok = window.confirm(
      "确定删除此子分类吗？分类下的产品不会被删除。"
    );
    if (!ok) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteSubCategory} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <button
        type="submit"
        className="admin-btn admin-btn-danger admin-btn-sm"
      >
        删除
      </button>
    </form>
  );
}
