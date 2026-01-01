"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";

// --- Constants ---
const CART_STORAGE_KEY = "beaux_cart";

// --- Types ---
export interface CartItem {
  id: string | number;
  title: string;
  price: number;
  image: string | string[];
  quantity: number;
  artist?: string;
  category?: string;
}


export type CartItemInput = Omit<CartItem, "quantity">;

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItemInput) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- 1. Optimized Load Effect ---
  useEffect(() => {
    const initializeCart = () => {
      if (typeof window === "undefined") return;

      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setItems(parsed);
        } catch (e) {
          console.error("Error parsing cart from localStorage:", e);
        }
      }
      setIsInitialized(true);
    };

   
    initializeCart();
  }, []);

  // --- 2. Save Effect ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // --- 3. Stable Actions (useCallback) ---
  
  const addToCart = useCallback((product: CartItemInput) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []); // Dependencies are empty because we use functional state updates

  const removeFromCart = useCallback((productId: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string | number, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart] // Depends on removeFromCart
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const handleSetIsCartOpen = useCallback((open: boolean) => {
    setIsCartOpen(open);
  }, []);

  // --- 4. Computed Values (Memoized) ---
  const cartTotals = useMemo(() => {
    return items.reduce(
      (totals, item) => ({
        totalItems: totals.totalItems + item.quantity,
        totalPrice: totals.totalPrice + item.price * item.quantity,
      }),
      { totalItems: 0, totalPrice: 0 }
    );
  }, [items]);

  // --- 5. Context Value (Memoized) ---
  
  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems: cartTotals.totalItems,
      totalPrice: cartTotals.totalPrice,
      isCartOpen,
      setIsCartOpen: handleSetIsCartOpen,
      isInitialized,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotals,
      isCartOpen,
      handleSetIsCartOpen,
      isInitialized,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}