"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart items
      items: [], // [{ courseId, title, price, thumbnail }]
      totalPrice: 0,

      // Actions
      addToCart: (course) => {
        const { items } = get()
        const exists = items.find((item) => item.courseId === course.id)

        if (!exists) {
          const newItems = [
            ...items,
            {
              courseId: course.id,
              title: course.title,
              price: course.price,
              thumbnail: course.thumbnail,
            },
          ]
          set({
            items: newItems,
            totalPrice: newItems.reduce((sum, item) => sum + item.price, 0),
          })
          return true
        }
        return false
      },

      removeFromCart: (courseId) => {
        const { items } = get()
        const newItems = items.filter((item) => item.courseId !== courseId)
        set({
          items: newItems,
          totalPrice: newItems.reduce((sum, item) => sum + item.price, 0),
        })
      },

      getCartItems: () => get().items,

      getCartTotal: () => get().totalPrice,

      getCartCount: () => get().items.length,

      isInCart: (courseId) => {
        const { items } = get()
        return items.some((item) => item.courseId === courseId)
      },

      clearCart: () =>
        set({
          items: [],
          totalPrice: 0,
        }),

      getCheckoutData: () => {
        const { items } = get()
        return {
          courses: items.map((item) => item.courseId),
          total: items.reduce((sum, item) => sum + item.price, 0),
          itemCount: items.length,
        }
      },
    }),
    {
      name: "cart-store",
    },
  ),
)
