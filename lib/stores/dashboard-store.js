"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      activeTab: "dashboard",

      // Filter state
      filterStatus: "all", // 'all', 'in-progress', 'completed'
      searchQuery: "",
      sortBy: "recent", // 'recent', 'title', 'progress'

      // Preferences
      theme: "light",
      notifications: {
        email: true,
        browser: true,
      },

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setFilterStatus: (status) => set({ filterStatus: status }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => set({ sortBy: sort }),

      setTheme: (theme) => set({ theme }),

      setNotifications: (notifications) =>
        set({
          notifications: {
            ...notifications,
          },
        }),

      resetFilters: () =>
        set({
          filterStatus: "all",
          searchQuery: "",
          sortBy: "recent",
        }),

      getFiltersState: () => ({
        filterStatus: get().filterStatus,
        searchQuery: get().searchQuery,
        sortBy: get().sortBy,
      }),
    }),
    {
      name: "dashboard-store",
    },
  ),
)
