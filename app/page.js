"use client"

import Navbar from "@/components/Home/Navbar"
import HeroSection from "@/components/Home/HeroSection"
import FeaturesSection from "@/components/Home/FeaturesSection"
import CoursesSection from "@/components/Home/CoursesSection"
import CTASection from "@/components/Home/CTASection"
import Footer from "@/components/Home/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
