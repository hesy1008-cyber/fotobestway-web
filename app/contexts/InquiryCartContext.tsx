"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface InquiryItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  quantity: number;
}

interface InquiryCartContextType {
  items: InquiryItem[];
  isOpen: boolean;
  addItem: (item: Omit<InquiryItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
}

const InquiryCartContext = createContext<InquiryCartContextType | undefined>(undefined);

export function InquiryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: Omit<InquiryItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <InquiryCartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        itemCount,
      }}
    >
      {children}
    </InquiryCartContext.Provider>
  );
}

export function useInquiryCart() {
  const context = useContext(InquiryCartContext);
  if (!context) {
    throw new Error("useInquiryCart must be used within InquiryCartProvider");
  }
  return context;
}
