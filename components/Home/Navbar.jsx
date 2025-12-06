"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { GraduationCap, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 20 ? "bg-background/80 backdrop-blur-lg shadow-lg border-b border-border" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              SmartLearn
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Learn. Discover. Excel.</p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-3 items-center">
          <ThemeToggle />
          <Link href="/auth/signin">
            <button className="px-5 py-2 text-foreground hover:text-primary transition-colors font-medium">
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-medium hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full px-5 py-2 text-foreground hover:text-primary transition-colors font-medium text-left">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-medium hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
