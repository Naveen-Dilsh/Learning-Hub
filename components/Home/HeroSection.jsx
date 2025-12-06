"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Atom, FlaskConical, Microscope, Star, Play } from "lucide-react"
import Image from "next/image"

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const teacherImages = [
    { src: "/teacher.png", alt: "Science Teacher 1" },
    { src: "/teacher.png", alt: "Science Teacher 2" },
    { src: "/teacher.png", alt: "Science Teacher 3" },
  ]

  useEffect(() => {
    setIsClient(true)
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % teacherImages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 lg:pt-10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl bg-blue-400/20 animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl bg-purple-400/20 animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl bg-green-400/20 animate-pulse"
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
            <h1 className="text-4xl sm:text-5xl font-black leading-none text-center">
              <span className="font-[family-name:var(--font-sinhala)] text-slate-800">ආස හිතෙන</span>
              <br />
              <span className="font-[family-name:var(--font-shrikhand)] bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Science..
              </span>
            </h1>
          </div>

          {/* Image Section - Second on mobile */}
          <div className="relative flex lg:hidden items-center justify-center w-full h-[400px] sm:h-[500px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Decorative glow behind teacher */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-green-400/30 blur-3xl"></div>
              </div>

              {/* Floating science icons - mobile */}
              <div
                className="absolute top-[5%] left-[5%] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite" }}
                aria-hidden="true"
              >
                <Atom className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              <div
                className="absolute top-[10%] right-[5%] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "1s" }}
                aria-hidden="true"
              >
                <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              <div
                className="absolute bottom-[15%] left-[8%] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "2s" }}
                aria-hidden="true"
              >
                <Microscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Teacher Images with Crossfade Transition */}
              <div className="relative z-10 w-full h-full max-w-[350px] max-h-[350px] sm:max-w-[450px] sm:max-h-[450px] flex items-center justify-center">
                {teacherImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-1000 ${
                      currentImage === index ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 350px, 450px"
                      priority={index === 0}
                      quality={85}
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                ))}
              </div>

              {/* Slideshow Indicators */}
              {isClient && (
                <div
                  className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex gap-2 z-20"
                  role="tablist"
                  aria-label="Image slideshow controls"
                >
                  {teacherImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`transition-all duration-300 rounded-full ${
                        currentImage === index ? "bg-blue-600 w-8 h-2" : "bg-slate-300 hover:bg-slate-400 w-2 h-2"
                      }`}
                      role="tab"
                      aria-selected={currentImage === index}
                      aria-label={`View slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating badge */}
              <div
                className="absolute bottom-[10%] right-[5%] px-3 py-2 sm:px-4 sm:py-3 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 will-change-transform z-20"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-slate-800">5.0</p>
                    <p className="text-xs text-slate-600">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Content - Third on mobile */}
          <div className="space-y-6 flex flex-col justify-center">
            {/* Heading - Desktop only */}
            <h1 className="hidden lg:block text-5xl lg:text-8xl font-black leading-none">
              <span className="font-[family-name:var(--font-sinhala)] text-slate-800">ආස හිතෙන</span>
              <br />
              <span className="font-[family-name:var(--font-shrikhand)] bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Science..
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl text-center lg:text-left">
              Explore Physics, Chemistry, and Biology through interactive lessons, virtual labs, and expert-led courses.
              Transform your understanding of science today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
                aria-label="Explore our science courses"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
                aria-label="Watch demo video"
              >
                <Play className="w-5 h-5" aria-hidden="true" />
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2" role="list">
              <div
                className="text-center p-3 sm:p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-all"
                role="listitem"
              >
                <p
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  aria-label="50,000 plus students"
                >
                  50K+
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">Students</p>
              </div>
              <div
                className="text-center p-3 sm:p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-all"
                role="listitem"
              >
                <p
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  aria-label="500 plus courses"
                >
                  500+
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">Courses</p>
              </div>
              <div
                className="text-center p-3 sm:p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-all"
                role="listitem"
              >
                <p
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  aria-label="98 percent success rate"
                >
                  98%
                </p>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">Success</p>
              </div>
            </div>
          </div>

          {/* Desktop Image Section */}
          <div
            className="relative hidden lg:flex items-center justify-center"
            style={{ height: "calc(100vh - 100px)" }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Decorative glow behind teacher */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-green-400/30 blur-3xl"></div>
              </div>

              {/* Floating science icons */}
              <div
                className="absolute top-[13%] left-[5%] w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite" }}
                aria-hidden="true"
              >
                <Atom className="w-8 h-8 lg:w-8 lg:h-10 text-white" />
              </div>

              <div
                className="absolute top-[25%] right-[5%] w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "1s" }}
                aria-hidden="true"
              >
                <FlaskConical className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>

              <div
                className="absolute bottom-[25%] left-[8%] w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl will-change-transform"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "2s" }}
                aria-hidden="true"
              >
                <Microscope className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>

              {/* Teacher Images with Crossfade Transition */}
              <div className="relative z-10 w-full h-full max-w-[550px] max-h-[550px] flex items-center justify-center">
                {teacherImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-1000 ${
                      currentImage === index ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      sizes="550px"
                      priority={index === 0}
                      quality={85}
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                ))}
              </div>

              {/* Slideshow Indicators */}
              {isClient && (
                <div
                  className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex gap-2 z-20"
                  role="tablist"
                  aria-label="Image slideshow controls"
                >
                  {teacherImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`transition-all duration-300 rounded-full ${
                        currentImage === index ? "bg-blue-600 w-8 h-2" : "bg-slate-300 hover:bg-slate-400 w-2 h-2"
                      }`}
                      role="tab"
                      aria-selected={currentImage === index}
                      aria-label={`View slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating badge */}
              <div
                className="absolute bottom-[15%] right-[8%] px-5 py-3 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 will-change-transform z-20"
                style={{ animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800">5.0</p>
                    <p className="text-xs text-slate-600">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}
