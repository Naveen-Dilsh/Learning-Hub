"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react"

function scrollToId(id) {
  if (typeof window === "undefined") return
  const el = document.getElementById(id)
  if (!el) return
  const navHeight = 72
  const y = el.getBoundingClientRect().top + window.scrollY - navHeight
  window.scrollTo({ top: y, behavior: "smooth" })
}

function SocialIcon({ icon: Icon, label }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-8 h-8 rounded-full bg-[var(--hero-card-bg)] border border-[var(--hero-card-border)] flex items-center justify-center hover:bg-[var(--hero-gradient-start)] hover:text-white transition-all"
    >
      <Icon className="w-4 h-4" />
    </a>
  )
}

export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-[var(--hero-card-border)] bg-[var(--hero-bg-start)]/60 backdrop-blur-sm pt-10 pb-6"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* 3-column card row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Brand card */}
          <div className="rounded-2xl border bg-[var(--hero-card-bg)] border-[var(--hero-card-border)] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-28 h-9 sm:w-32 sm:h-10 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/images/Logo.png"
                  alt="E-pencil Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--hero-text-secondary)] font-[family-name:var(--font-sinhala)]">
              විද්‍යාව අසීරු දේ නොව, ආස හිතෙන දෙයක් බවට පත් කරන O/L විද්‍යා පන්තිය.
            </p>
          </div>

          {/* Quick links card */}
          <div className="rounded-2xl border bg-[var(--hero-card-bg)] border-[var(--hero-card-border)] p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-[var(--hero-text-primary)] mb-3 font-[family-name:var(--font-sinhala)]">
              වේගවත් සබැඳි
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-[family-name:var(--font-sinhala)]">
              <li>
                <button
                  onClick={() => scrollToId("process")}
                  className="text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors"
                >
                  අපගේ ක්‍රියාවලිය
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("teacher")}
                  className="text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors"
                >
                  ගුරුවරයා
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("testimonials")}
                  className="text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors"
                >
                  සිසු අදහස්
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToId("lms")}
                  className="text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors"
                >
                  Online LMS
                </button>
              </li>
            </ul>
          </div>

          {/* Contact card */}
          <div className="rounded-2xl border bg-[var(--hero-card-bg)] border-[var(--hero-card-border)] p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-[var(--hero-text-primary)] mb-3 font-[family-name:var(--font-sinhala)]">
              සම්බන්ධ වෙන්න
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-[family-name:var(--font-sinhala)] text-[var(--hero-text-secondary)]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+947XXXXXXXX" className="hover:text-[var(--hero-text-primary)] transition-colors">
                  +94 7X XXX XXXX
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:info@epencil.lk"
                  className="hover:text-[var(--hero-text-primary)] transition-colors"
                >
                  info@epencil.lk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>මාතර / කොළඹ පංති මධ්‍යස්ථාන</span>
              </li>
            </ul>

            <div className="mt-4 flex gap-3">
              <SocialIcon icon={Facebook} label="Facebook" />
              <SocialIcon icon={Instagram} label="Instagram" />
              <SocialIcon icon={Youtube} label="YouTube" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-[var(--hero-card-border)] flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs text-[var(--hero-text-secondary)]">
          <p className="font-[family-name:var(--font-sinhala)]">
            © {new Date().getFullYear()} ආස හිතෙන Science. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy" className="hover:text-[var(--hero-text-primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--hero-text-primary)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-[var(--hero-text-primary)] transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
