"use client"

import Navbar from "@/components/Home/Navbar"
import HeroSection from "@/components/Home/HeroSection"
import FeaturesSection from "@/components/Home/FeaturesSection"
import CoursesSection from "@/components/Home/CoursesSection"
import TeacherProfileSection from "@/components/Home/TeacherProfileSection"
import Footer from "@/components/Home/Footer"
import Testimonials from "@/components/Home/Testimonials"

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
