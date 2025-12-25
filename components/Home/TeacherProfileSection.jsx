"use client"

import { GraduationCap, Award } from "lucide-react"
import Image from "next/image"

export default function TeacherProfileSection() {
  return (
    <section 
      className="py-8 lg:py-10 relative overflow-hidden"
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

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header - REDUCED */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-sinhala)] text-[var(--hero-text-primary)] mb-3">
            ගුරුවරයා පිළිබඳව
          </h2>
          <p className="text-base sm:text-lg text-[var(--hero-text-secondary)] max-w-3xl mx-auto">
            About the Teacher
          </p>
        </div>

        {/* Main Profile Card */}
        <div>
          <div 
            className="backdrop-blur-sm border rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--hero-card-bg)',
              borderColor: 'var(--hero-card-border)',
            }}
          >
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 p-6 lg:p-10">
              {/* Teacher Image Section */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[350px] lg:max-w-[400px]">
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-green-400/20 blur-3xl"></div>
                  </div>
                  
                  {/* Image Container */}
                  <div className="relative z-10 aspect-square rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: 'var(--hero-card-border)' }}>
                    <Image
                      src="/images/1.png"
                      alt="Chemistry Teacher"
                      fill
                      sizes="(max-width: 768px) 350px, 400px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Floating Achievement Badge */}
                  <div 
                    className="absolute -bottom-4 -right-4 px-4 py-3 rounded-2xl shadow-xl border-2 z-20"
                    style={{
                      backgroundColor: 'var(--hero-badge-bg)',
                      borderColor: 'var(--hero-badge-border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[var(--hero-badge-text)]">2020</p>
                        <p className="text-xs text-[var(--hero-badge-text-muted)]">A/L Biology</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-center space-y-5">
                {/* Qualification Badge */}
                <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full" style={{
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  border: '1px solid rgba(147, 51, 234, 0.3)'
                }}>
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    Chemistry Undergraduate
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed font-[family-name:var(--font-sinhala)]">
                    2020 වසරේ ජීව විද්‍යා අංශයේ උසස් පෙල විභාගයට පෙනී සිටින ඔහු මේ වනවිට රසායන විද්‍යාව පිලිබදව ගුරු උපාදිය සම්පූර්ණ කරමින් සිටී.
                  </p>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed font-[family-name:var(--font-sinhala)]">
                    ඉතා කෙටි කාලයකින් පන්තිය සාර්ථක වීමට හේතුව වනුයේ ඔනෑම මට්ටමක දරුවකු හට විෂය තේරුම් කරදීමට ඔහු දක්වන සුවිශේෂී දක්ෂතාවයි.
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <div 
                    className="p-4 rounded-xl backdrop-blur-sm border transition-all"
                    style={{
                      backgroundColor: 'var(--hero-card-bg)',
                      borderColor: 'var(--hero-card-border)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--hero-text-primary)] font-[family-name:var(--font-sinhala)]">
                      2020 උ.පෙ.
                    </p>
                    <p className="text-xs text-[var(--hero-text-secondary)] font-[family-name:var(--font-sinhala)]">
                      ජීව විද්‍යා
                    </p>
                  </div>

                  <div 
                    className="p-4 rounded-xl backdrop-blur-sm border transition-all"
                    style={{
                      backgroundColor: 'var(--hero-card-bg)',
                      borderColor: 'var(--hero-card-border)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--hero-text-primary)] font-[family-name:var(--font-sinhala)]">
                      රසායන විද්‍යාව
                    </p>
                    <p className="text-xs text-[var(--hero-text-secondary)] font-[family-name:var(--font-sinhala)]">
                      උපාදිධාරී
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Teaching Strengths Cards - REMOVED */}
      </div>
    </section>
  )
}
