"use client";

import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const ok = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!ok) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteProduct} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        style={{
          background: "#dc2626",
          color: "#fff",
          border: "none",
          padding: "6px 14px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </form>
  );
}
