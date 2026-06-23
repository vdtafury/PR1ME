import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/types';

export interface CartItem {
  id: string; // generated from product.id + size + color
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (product, quantity, size, color) => set((state) => {
        const id = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`;
        const existingItem = state.items.find(i => i.id === id);
        
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === id ? { ...i, quantity: i.quantity + quantity } : i
            ),
            isCartOpen: true
          };
        }
        
        return {
          items: [...state.items, { id, product, quantity, selectedSize: size, selectedColor: color }],
          isCartOpen: true
        };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen })
    }),
    {
      name: 'nova-cart-storage',
      partialize: (state) => ({ items: state.items }), // Persist only items
    }
  )
);
