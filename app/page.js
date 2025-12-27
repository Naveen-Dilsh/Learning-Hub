"use client"

import dynamic from 'next/dynamic'
import Navbar from "@/components/Home/Navbar"
import HeroSection from "@/components/Home/HeroSection"
import FeaturesSection from "@/components/Home/FeaturesSection"
import CoursesSection from "@/components/Home/CoursesSection"
import TeacherProfileSection from "@/components/Home/TeacherProfileSection"
import Testimonials from "@/components/Home/Testimonials"

// ✅ Lazy load footer (below fold)
const Footer = dynamic(() => import('@/components/Home/Footer'), {
  loading: () => <div className="h-64 bg-background" />
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <section id="process">
        <CoursesSection />
      </section>
      <section id="teacher">
        <TeacherProfileSection />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <section id="footer">
        <Footer />
      </section>
    </div>
  )
}
