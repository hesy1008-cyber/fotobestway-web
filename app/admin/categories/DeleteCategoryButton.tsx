"use client";

import { deleteCategory } from "./actions";

export default function DeleteCategoryButton({ id }: { id: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const ok = window.confirm(
      "确定删除此分类吗？分类下的产品不会被删除。"
    );
    if (!ok) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteCategory} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn-danger admin-btn-sm">
        删除
      </button>
    </form>
  );
}
