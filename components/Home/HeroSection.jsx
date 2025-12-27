"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ArrowRight, Atom, FlaskConical, Microscope, Star, Play, X } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"

const teacherImages = [
  { src: "/images/2.png", alt: "Science Teacher 1" },
  { src: "/images/3.png", alt: "Science Teacher 2" },
  { src: "/images/4.png", alt: "Science Teacher 3" },
]

// Demo video URL - replace with your actual video URL
const DEMO_VIDEO_URL = "https://customer-4tnscqgonlylt4dq.cloudflarestream.com/cd7da1ac77750f5fa4273fff66a1981f/iframe?poster=https%3A%2F%2Fcustomer-4tnscqgonlylt4dq.cloudflarestream.com%2Fcd7da1ac77750f5fa4273fff66a1981f%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600" // Replace with your video URL

// Floating Science Icon Component
const FloatingIcon = ({ icon: Icon, position, delay = 0, className = "" }) => (
  <div
    className={`absolute ${position} rounded-2xl flex items-center justify-center shadow-2xl will-change-transform ${className}`}
    style={{ animation: "float 3s ease-in-out infinite", animationDelay: `${delay}s` }}
    aria-hidden="true"
  >
    <Icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
  </div>
)

// Slideshow Indicators Component
const SlideshowIndicators = ({ total, current, onSelect, className = "" }) => (
  <div
    className={`absolute bottom-[5%] lg:bottom-[8%] left-1/2 -translate-x-1/2 flex gap-2 z-20 ${className}`}
    role="tablist"
    aria-label="Image slideshow controls"
  >
    {Array.from({ length: total }).map((_, index) => (
      <button
        key={index}
        onClick={() => onSelect(index)}
        className={`transition-all duration-300 rounded-full ${
          current === index
            ? "bg-[var(--hero-indicator-active)] w-8 h-2"
            : "bg-[var(--hero-indicator-inactive)] hover:opacity-70 w-2 h-2"
        }`}
        role="tab"
        aria-selected={current === index}
        aria-label={`View slide ${index + 1}`}
      />
    ))}
  </div>
)

// Floating Badge Component
const FloatingBadge = ({ className = "" }) => (
  <div
    className={`absolute bottom-[10%] lg:bottom-[15%] right-[5%] lg:right-[8%] px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3 bg-[var(--hero-badge-bg)] rounded-2xl shadow-2xl border-2 border-[var(--hero-badge-border)] will-change-transform z-20 ${className}`}
    style={{ animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white fill-white" />
      </div>
      <div>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--hero-badge-text)]">5.0</p>
        <p className="text-xs text-[var(--hero-badge-text-muted)]">Top Rated</p>
      </div>
    </div>
  </div>
)

// Image Section Component (reusable for mobile and desktop)
const ImageSection = ({ isMobile = false, currentImage, onImageSelect, isClient }) => {
  const containerClass = isMobile
    ? "relative flex lg:hidden items-center justify-center w-full h-[400px] sm:h-[500px]"
    : "relative hidden lg:flex items-center justify-center"
  const containerStyle = isMobile ? {} : { height: "calc(100vh - 100px)" }
  const glowSize = isMobile ? "w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]" : "w-[500px] h-[500px]"
  const imageMaxSize = isMobile
    ? "max-w-[350px] max-h-[350px] sm:max-w-[450px] sm:max-h-[450px]"
    : "max-w-[550px] max-h-[550px]"
  const imageSizes = isMobile ? "(max-width: 640px) 350px, 450px" : "550px"

  const iconPositions = useMemo(
    () => [
      {
        icon: Atom,
        position: isMobile ? "top-[5%] left-[5%]" : "top-[13%] left-[5%]",
        gradient: "from-blue-500 to-cyan-500",
        delay: 0,
        size: isMobile ? "w-12 h-12 sm:w-16 sm:h-16" : "w-16 h-16 lg:w-20 lg:h-20",
        zIndex: "", 
      },
      {
        icon: FlaskConical,
        position: isMobile ? "top-[10%] right-[5%]" : "top-[25%] right-[5%]",
        gradient: "from-purple-500 to-pink-500",
        delay: 1,
        size: isMobile ? "w-12 h-12 sm:w-16 sm:h-16" : "w-16 h-16 lg:w-20 lg:h-20",
        zIndex: "", 
      },
      {
        icon: Microscope,
        position: isMobile ? "bottom-[15%] left-[8%]" : "bottom-[25%] left-[8%]",
        gradient: "from-green-500 to-emerald-500",
        delay: 2,
        size: isMobile ? "w-12 h-12 sm:w-16 sm:h-16" : "w-16 h-16 lg:w-20 lg:h-20",
        zIndex: "z-30", 
      },
    ],
    [isMobile],
  )

  return (
    <div className={containerClass} style={containerStyle}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Decorative glow behind teacher */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div
            className={`${glowSize} rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-green-400/30 blur-3xl`}
          ></div>
        </div>

        {/* Floating science icons */}
        {iconPositions.map(({ icon, position, gradient, delay, size, zIndex }) => (
          <FloatingIcon
            key={position}
            icon={icon}
            position={position}
            delay={delay}
            className={`${size} bg-gradient-to-br ${gradient} ${zIndex}`}
          />
        ))}

        {/* Teacher Images with Crossfade Transition */}
        <div className={`relative z-10 w-full h-full ${imageMaxSize} flex items-center justify-center`}>
          {teacherImages.map((image, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                currentImage === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={imageSizes}
                priority={index === 0} // ✅ Already correct
                quality={75} // ⬇️ Reduce from 85 to 75
                className="object-contain drop-shadow-2xl"
              />

            </div>
          ))}
        </div>

        {/* Slideshow Indicators */}
        {isClient && (
          <SlideshowIndicators
            total={teacherImages.length}
            current={currentImage}
            onSelect={onImageSelect}
          />
        )}

        {/* Floating badge */}
        <FloatingBadge />
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const handleImageSelect = useCallback((index) => {
    setCurrentImage(index)
  }, [])

  useEffect(() => {
    setIsClient(true)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % teacherImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <section
        className="relative min-h-screen pt-10 sm:pt-16  flex items-center overflow-hidden bg-gradient-to-br from-[var(--hero-bg-start)] via-[var(--hero-bg-mid)] to-[var(--hero-bg-end)] lg:pt-5"
        style={{
          background: `linear-gradient(to bottom right, var(--hero-bg-start), var(--hero-bg-mid), var(--hero-bg-end))`,
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl bg-blue-400/20 dark:bg-blue-500/10 animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl bg-purple-400/20 dark:bg-purple-500/10 animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl bg-green-400/20 dark:bg-green-500/10 animate-pulse"
            style={{ animationDuration: "5s", animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full py-8">
          <div
            className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-10 items-center"
            style={{ minHeight: "calc(100vh - 80px)" }}
          >
            {/* Heading - First on mobile */}
            <div className="w-full lg:hidden">
              <h1 className="text-5xl sm:text-5xl font-black  text-center">
                <span className="font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)]">
                  ආස හිතෙන
                </span>
                <br />
                <span
                  className="font-[family-name:var(--font-shrikhand)] bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--hero-gradient-start), var(--hero-gradient-mid), var(--hero-gradient-end))`,
                  }}
                >
                  Science..
                </span>
              </h1>
            </div>

            {/* Image Section - Mobile */}
            <ImageSection
              isMobile={true}
              currentImage={currentImage}
              onImageSelect={handleImageSelect}
              isClient={isClient}
            />

            {/* Left Content */}
            <div className="space-y-6 flex flex-col justify-center">
              {/* Heading - Desktop only */}
              <h1 className="hidden lg:block text-5xl lg:text-8xl font-black leading-none">
                <span className="font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)]">
                  ආස හිතෙන
                </span>
                <br />
                <span
                  className="font-[family-name:var(--font-shrikhand)] bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--hero-gradient-start), var(--hero-gradient-mid), var(--hero-gradient-end))`,
                  }}
                >
                  Science..
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-[var(--hero-text-secondary)] leading-relaxed max-w-xl text-center lg:text-left">
                Explore Physics, Chemistry, and Biology through interactive lessons, virtual labs, and expert-led
                courses. Transform your understanding of science today.
              </p>
              
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/student/browse-course">
                <button
                  className="px-6 py-3 text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
                  style={{
                    background: `linear-gradient(to right, var(--hero-button-primary-start), var(--hero-button-primary-end))`,
                    boxShadow: `0 0 0 0 var(--hero-button-primary-shadow)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 25px -5px var(--hero-button-primary-shadow), 0 10px 10px -5px var(--hero-button-primary-shadow)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 var(--hero-button-primary-shadow)`
                  }}
                  aria-label="Explore our science courses"
                >
                  Explore Courses
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                </Link>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="px-6 py-3 border-2 border-[var(--hero-button-secondary-border)] text-[var(--hero-button-secondary-text)] font-semibold rounded-xl hover:bg-[var(--hero-button-secondary-hover)] transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
                  aria-label="Watch demo video"
                >
                  <Play className="w-5 h-5" aria-hidden="true" />
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2" role="list">
                <div
                  className="text-center p-3 sm:p-4 rounded-xl backdrop-blur-sm border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: "var(--hero-card-bg)",
                    borderColor: "var(--hero-card-border)",
                  }}
                  role="listitem"
                >
                  <p
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--hero-gradient-start), var(--hero-gradient-mid))`,
                    }}
                    aria-label="50,000 plus students"
                  >
                    10K+
                  </p>
                  <p className="text-[var(--hero-text-secondary)] text-xs sm:text-sm mt-1 font-medium">Students</p>
                </div>
                <div
                  className="text-center p-3 sm:p-4 rounded-xl backdrop-blur-sm border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: "var(--hero-card-bg)",
                    borderColor: "var(--hero-card-border)",
                  }}
                  role="listitem"
                >
                  <p
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--hero-gradient-mid), #ec4899)`,
                    }}
                    aria-label="500 plus courses"
                  >
                    20+
                  </p>
                  <p className="text-[var(--hero-text-secondary)] text-xs sm:text-sm mt-1 font-medium">Courses</p>
                </div>
                <div
                  className="text-center p-3 sm:p-4 rounded-xl backdrop-blur-sm border hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: "var(--hero-card-bg)",
                    borderColor: "var(--hero-card-border)",
                  }}
                  role="listitem"
                >
                  <p
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, var(--hero-gradient-end), #10b981)`,
                    }}
                    aria-label="98 percent success rate"
                  >
                    98%
                  </p>
                  <p className="text-[var(--hero-text-secondary)] text-xs sm:text-sm mt-1 font-medium">Success</p>
                </div>
              </div>
            </div>

            {/* Desktop Image Section */}
            <ImageSection
              isMobile={false}
              currentImage={currentImage}
              onImageSelect={handleImageSelect}
              isClient={isClient}
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </section>

      {/* Video Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-6xl w-[98vw] p-0 bg-background border-10">
          <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
            <iframe
              src={isVideoOpen ? DEMO_VIDEO_URL : ""}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Demo Video"
            />
            {/* Custom Close Button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
