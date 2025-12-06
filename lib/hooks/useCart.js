"use client"

import { useCartStore } from "@/lib/stores"

export const useCart = () => {
  const {
    items,
    totalPrice,
    addToCart,
    removeFromCart,
    getCartItems,
    getCartTotal,
    getCartCount,
    isInCart,
    clearCart,
    getCheckoutData,
  } = useCartStore()

  return {
    items,
    totalPrice,
    cartCount: getCartCount(),
    isInCart,
    addToCart,
    removeFromCart,
    clearCart,
    getCheckoutData,
  }
}
