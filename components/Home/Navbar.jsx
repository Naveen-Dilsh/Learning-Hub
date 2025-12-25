"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, BookOpen, Users, Award, Phone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "අපගේ ක්‍රියාවලිය", href: "#process", icon: BookOpen, nameEn: "Courses" },
    { name: "ගුරුවරයා", href: "#teacher", icon: Users, nameEn: "Teacher" },
    { name: "අදහස්", href: "#testimonials", icon: Award, nameEn: "Results" },
    { name: "අමතන්න", href: "#footer", icon: Phone, nameEn: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20
          ? "bg-background/90 backdrop-blur-xl shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
            <div className="relative w-36 h-12 sm:w-40 sm:h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    const id = link.href.replace("#", "")
                    const el = document.getElementById(id)
                    if (el) {
                      const navHeight = 72 // ~px, adjust if needed
                      const y = el.getBoundingClientRect().top + window.scrollY - navHeight
                      window.scrollTo({ top: y, behavior: "smooth" })
                    }
                  }}
                  className="px-4 py-2 text-sm md:text-[15px] font-semibold text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors font-[family-name:var(--font-sinhala)] relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--hero-gradient-start)] to-[var(--hero-gradient-mid)] group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>



          {/* Desktop Actions */}
          <div className="hidden lg:flex gap-3 items-center">
            <ThemeToggle />
            <Link href="/auth/signin">
              <button className="px-5 py-2 text-sm md:text-[15px] font-semibold text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button 
                className="px-6 py-2.5 text-sm md:text-[15px] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(to right, var(--hero-button-primary-start), var(--hero-button-primary-end))`,
                }}
              >
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-lg backdrop-blur-sm border border-border hover:bg-accent/20 flex items-center justify-center transition-all"
              style={{
                backgroundColor: "var(--hero-card-bg)",
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden backdrop-blur-xl border-t"
          style={{
            backgroundColor: "var(--hero-card-bg)",
            borderColor: "var(--hero-card-border)",
          }}
        >
          <div className="px-4 sm:px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  const id = link.href.replace("#", "")
                  const el = document.getElementById(id)
                  if (el) {
                    const navHeight = 72 // same as above
                    const y = el.getBoundingClientRect().top + window.scrollY - navHeight
                    window.scrollTo({ top: y, behavior: "smooth" })
                  }
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-accent/10 transition-colors flex items-center gap-3 group"
              >
                <link.icon className="w-5 h-5 text-[var(--hero-gradient-start)] group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-[var(--hero-text-primary)] font-[family-name:var(--font-sinhala)]">
                    {link.name}
                  </p>
                  <p className="text-xs text-[var(--hero-text-secondary)]">
                    {link.nameEn}
                  </p>
                </div>
              </button>
            ))}

            

            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full px-5 py-2.5 text-center font-semibold text-[var(--hero-text-primary)] hover:bg-accent/10 rounded-xl transition-colors font-[family-name:var(--font-sinhala)]">
                  පිවිසෙන්න
                </button>
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                <button 
                  className="w-full px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all font-[family-name:var(--font-sinhala)]"
                  style={{
                    background: `linear-gradient(to right, var(--hero-button-primary-start), var(--hero-button-primary-end))`,
                  }}
                >
                  ලියාපදිංචි වන්න
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
