"use client";

import { deleteCategory } from "./actions";

export default function DeleteCategoryButton({ id }: { id: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const ok = window.confirm(
      "Are you sure you want to delete this category? Products in this category will NOT be deleted."
    );
    if (!ok) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteCategory} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="admin-btn admin-btn-danger admin-btn-sm">
        Delete
      </button>
    </form>
  );
}
