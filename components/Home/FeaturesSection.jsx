"use client"

import { useState } from "react"
import { BookOpen, TrendingUp } from "lucide-react"

export default function FeaturesSection() {
  const [hoveredCard, setHoveredCard] = useState(null)

  const features = [
    {
      icon: BookOpen,
      title: "Exams",
      titleSinhala: "විභාග",
      description:
        "Final Paper වැඩසටහන සමග විභාග මට්ටමේ ප්‍රශ්නපත්‍ර රැසක් සුවිශේෂී සම්මන්ත්‍රණ මාලාවක් සමග විභාගයට විශිෂ්ඨ පෙරහුරුවක් ලබාදීම",
      accentColor: "#2563eb",
    },
    {
      icon: TrendingUp,
      title: "Results",
      titleSinhala: "ප්‍රතිඵල",
      description:
        "100% සමස්ථ ප්‍රතිඵලය අණ්ඩව රදවා ගනිමින් විශිෂ්ඨ ප්‍රතිඵල සමග විශ්වාසය දිනූ විද්‍යාව පන්තිය",
      accentColor: "#16a34a",
    },
  ]

  return (
    <section 
      className="py-8 lg:py-10 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, var(--hero-bg-start), var(--hero-bg-mid), var(--hero-bg-end))`,
      }}
    >
      {/* Animated Background Elements - Same as Hero */}
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - REDUCED */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
            <span className="font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)]">
              අපගේ විශේෂත්වය
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--hero-text-secondary)] max-w-3xl mx-auto font-[family-name:var(--font-sinhala)]">
            විභාග සාර්ථකත්වය සහ විශිෂ්ඨ ප්‍රතිඵල සඳහා සම්පූර්ණ සහය ලබාදීම 
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative rounded-3xl sm:rounded-[2rem] overflow-hidden transition-all duration-500"
              style={{
                transform: hoveredCard === index ? "translateY(-8px)" : "translateY(0)",
                boxShadow: hoveredCard === index 
                  ? `0 20px 40px -10px rgba(0,0,0,0.15)`
                  : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {/* Backdrop Blur Background */}
              <div 
                className="absolute inset-0 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--hero-card-bg)',
                  backdropFilter: hoveredCard === index ? 'blur(20px)' : 'blur(10px)',
                  border: `2px solid ${hoveredCard === index ? feature.accentColor + '60' : 'var(--hero-card-border)'}`,
                  borderRadius: 'inherit'
                }}
              ></div>

              {/* Subtle Gradient Overlay on Hover */}
              <div 
                className="absolute inset-0 opacity-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.accentColor}08, ${feature.accentColor}15)`,
                  opacity: hoveredCard === index ? 1 : 0
                }}
              ></div>

              {/* Card Content - REDUCED PADDING */}
              <div className="relative p-6 sm:p-8 lg:p-10">
                {/* Icon Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500"
                    style={{
                      background: hoveredCard === index 
                        ? `linear-gradient(to bottom right, ${feature.accentColor}, ${feature.accentColor}dd)` 
                        : `linear-gradient(to bottom right, var(--hero-gradient-start), var(--hero-gradient-mid))`,
                      transform: hoveredCard === index ? "rotate(5deg) scale(1.05)" : "rotate(0deg) scale(1)",
                    }}
                  >
                    <feature.icon 
                      className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-all duration-500" 
                    />
                  </div>

                  <div 
                    className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-500"
                    style={{
                      backgroundColor: hoveredCard === index ? `${feature.accentColor}20` : 'var(--hero-card-bg)',
                      color: hoveredCard === index ? feature.accentColor : 'var(--hero-text-secondary)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${hoveredCard === index ? `${feature.accentColor}30` : 'var(--hero-card-border)'}`
                    }}
                  >
                    {feature.title}
                  </div>
                </div>

                {/* Title - REDUCED */}
                <h3 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 font-[family-name:var(--font-sinhala)] transition-colors duration-500"
                  style={{
                    color: hoveredCard === index ? feature.accentColor : 'var(--hero-text-primary)'
                  }}
                >
                  {feature.titleSinhala}
                </h3>

                {/* Description */}
                <p 
                  className="text-sm sm:text-base leading-relaxed font-[family-name:var(--font-sinhala)] transition-colors duration-500"
                  style={{
                    color: 'var(--hero-text-secondary)'
                  }}
                >
                  {feature.description}
                </p>

                {/* Corner Accent - Subtle */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${feature.accentColor}15, transparent)`,
                    opacity: hoveredCard === index ? 1 : 0
                  }}
                ></div>
              </div>

              {/* Subtle Border Glow on Hover */}
              <div 
                className="absolute inset-0 rounded-3xl sm:rounded-[2rem] transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 20px ${feature.accentColor}20`,
                  opacity: hoveredCard === index ? 1 : 0
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
