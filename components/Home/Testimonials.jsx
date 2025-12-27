"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    name: "මෙහාරා බිනාදි",
    batch: "2024(2025) O/L batch",
    school: "බප/ජය මහාමායා බාලිකා විද්‍යාලය",
    grade: "S → B",
    text: "සර්ගෙ පන්ති එන්න කලින් S එකක වගේ හිටියෙ. සර් නිසා තමයි B එකක් ආවෙ. සර් උගන්වන දේවල් හොඳට තේරෙනවා. අපි කොච්චර ප්‍රශ්න ඇහුවත් උත්තර කියලා දුන්නා."
  },
  {
    name: "Thisal Ruwanpathirana",
    batch: "2024(2025) O/L batch",
    school: "Pannipitiya Daramapala College",
    grade: "Outstanding",
    text: "I appreciate all the time, effort, and care you put into helping me learn and grow. Your support and encouragement mean so much, and I'm truly grateful to have had you as my teacher."
  },
  {
    name: "Vishmi Shakya Prabudhini",
    batch: "2024(2025) O/L batch",
    school: "Kottawa Ananda Maha Vidhyalaya",
    grade: "Excellent",
    text: "මට හම්බුන හොදම පංතිය තමයි මේ විද්‍යාව පංතිය. මේ පන්තියට ආපු දවසේ ඉදන් උගන්නපු ඔකෝකොම පාඩම් ටික හොදට තේරුනා. ස්තුතියි සර් මෙච්චර අමාරු විශයක් ලේසියෙන් කියලා දුන්නට."
  },
  {
    name: "Senadi Senara",
    batch: "2024(2025) O/L batch",
    school: "Maharagama Vidyakara Balika Vidhyalaya",
    grade: "Top Student",
    text: "මම ආසාවෙන් ආපු එකම විද්‍යාපන්තිය තමයි මේක හිතට කාවදින විදිහට විද්‍යාව උගන්වන ගුරුතුමාට බුදු සරණයි! ලේසියෙන් මතක තියාගන්න ලේසි ක්‍රම ගොඩක් කියලා දුන්නා."
  },
  {
    name: "හන්සි සදමිණි ගුණවර්ධන",
    batch: "2024(2025) O/L batch",
    school: "බප/ජය මහාමායා බාලිකා විද්‍යාලය",
    grade: "Low → A",
    text: "සර්ගෙ පන්ති එන්න කලින් papers වලට අඩු ලකුණු තිබ්බේ. සර් නිසා තමයි A එකක් ආවෙ. කෙටි ක්‍රම නිසා උගන්වන වෙලාවෙම මතක හිටිනවා. සර්ට ගොඩක් ස්තුතියි!"
  }
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    setIsClient(true)
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 2; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length])
    }
    return visible
  }

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
            සිසුන්ගේ අදහස්
          </h2>
          <p className="text-base sm:text-lg text-[var(--hero-text-secondary)] max-w-3xl mx-auto">
            What Our Students Say
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={`${currentIndex}-${index}`}
                className="backdrop-blur-sm border rounded-2xl p-6 flex flex-col h-full"
                style={{
                  backgroundColor: 'var(--hero-card-bg)',
                  borderColor: 'var(--hero-card-border)',
                }}
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Quote className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mb-5 flex-1 font-[family-name:var(--font-sinhala)]">
                  "{testimonial.text}"
                </p>

                {/* Student Info */}
                <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--hero-card-border)' }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-base font-bold text-[var(--hero-text-primary)] font-[family-name:var(--font-sinhala)]">
                      {testimonial.name}
                    </h4>
                    <div 
                      className="px-3 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Star className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-current" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-sinhala)]">
                        {testimonial.grade}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--hero-text-secondary)] font-[family-name:var(--font-sinhala)] mb-1">
                    {testimonial.school}
                  </p>
                  <p className="text-xs text-[var(--hero-text-secondary)]">
                    {testimonial.batch}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: 'var(--hero-card-bg)',
                borderColor: 'var(--hero-card-border)',
              }}
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-6 h-6 text-[var(--hero-text-primary)]" />
            </button>

            {isClient && (
              <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentIndex === index ? "w-8 h-2" : "w-2 h-2"
                    }`}
                    style={{
                      backgroundColor: currentIndex === index 
                        ? 'var(--hero-indicator-active)' 
                        : 'var(--hero-indicator-inactive)'
                    }}
                    role="tab"
                    aria-selected={currentIndex === index}
                    aria-label={`View testimonial set ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: 'var(--hero-card-bg)',
                borderColor: 'var(--hero-card-border)',
              }}
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-6 h-6 text-[var(--hero-text-primary)]" />
            </button>
          </div>

          {/* Student Count */}
          <div className="mt-6 text-center">
            <div 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm border"
              style={{
                backgroundColor: 'var(--hero-card-bg)',
                borderColor: 'var(--hero-card-border)',
              }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(to right, var(--hero-gradient-start), var(--hero-gradient-mid))`,
                      borderColor: 'var(--hero-bg-start)'
                    }}
                  >
                    {testimonials[i - 1]?.name.charAt(0) || ''}
                  </div>
                ))}
              </div>
              {/* <span className="text-sm font-semibold text-[var(--hero-text-secondary)]">
                <span className="text-[var(--hero-text-primary)] font-bold">50,000+</span> සතුටු සිසුන්
              </span> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
