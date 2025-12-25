"use client"

import Navbar from "@/components/home/Navbar"
import HeroSection from "@/components/home/HeroSection"
import FeaturesSection from "@/components/home/FeaturesSection"
import CoursesSection from "@/components/home/CoursesSection"
import CTASection from "@/components/home/CTASection"
import Footer from "@/components/home/Footer"
import Testimonials from "@/components/home/Testimonials"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <CTASection />
      <Testimonials/>
      <Footer />
    </div>
  )
}
