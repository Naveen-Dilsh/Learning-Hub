"use client"

import { useDashboardStore } from "@/lib/stores"

export const useDashboard = () => {
  const {
    sidebarOpen,
    activeTab,
    filterStatus,
    searchQuery,
    sortBy,
    theme,
    notifications,
    toggleSidebar,
    setSidebarOpen,
    setActiveTab,
    setFilterStatus,
    setSearchQuery,
    setSortBy,
    setTheme,
    setNotifications,
    resetFilters,
    getFiltersState,
  } = useDashboardStore()

  return {
    sidebarOpen,
    activeTab,
    filterStatus,
    searchQuery,
    sortBy,
    theme,
    notifications,
    toggleSidebar,
    setSidebarOpen,
    setActiveTab,
    setFilterStatus,
    setSearchQuery,
    setSortBy,
    setTheme,
    setNotifications,
    resetFilters,
    getFiltersState,
  }
}
