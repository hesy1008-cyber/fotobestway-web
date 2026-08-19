"use client";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  CSS
} from "@dnd-kit/utilities";

import { useState } from "react";

function SortItem({
  img,
  onRemove,
}: {
  img: string;
  onRemove: (img: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: img,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-gallery-item"
    >
      <div {...attributes} {...listeners} className="sortable-gallery-drag">
        <img src={img} alt="Gallery item" />
      </div>
      <button
        type="button"
        onClick={() => onRemove(img)}
        className="sortable-gallery-remove"
        title="Remove image"
      >
        ×
      </button>
    </div>
  );
}

export default function SortableGallery({
  images,
  onChange,
  onRemove,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
  onRemove?: (img: string) => void;
}) {
  const [items, setItems] = useState(images);

  function handleRemove(img: string) {
    const newItems = items.filter((i) => i !== img);
    setItems(newItems);
    onChange(newItems);
    if (onRemove) {
      onRemove(img);
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (!over) {
          return;
        }

        if (active.id !== over.id) {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);

          const newItems = arrayMove(items, oldIndex, newIndex);
          setItems(newItems);
          onChange(newItems);
        }
      }}
    >
      <SortableContext
        items={items}
        strategy={horizontalListSortingStrategy}
      >
        <div className="sortable-gallery">
          {items.map((img) => (
            <SortItem
              key={img}
              img={img}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
