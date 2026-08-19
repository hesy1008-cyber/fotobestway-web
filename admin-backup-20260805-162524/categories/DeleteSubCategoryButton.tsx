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
      "Are you sure you want to delete this sub-category?"
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
        Delete
      </button>
    </form>
  );
}
