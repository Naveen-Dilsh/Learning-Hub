"use client"

import { BookOpen, Users, Star, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function CoursesSection() {
  const courses = [
    {
      title: "Quantum Mechanics Fundamentals",
      subject: "Physics",
      level: "Advanced",
      students: "2,341",
      rating: 4.9,
      image: "⚛️",
      gradient: "from-indigo-500/20 to-cyan-500/20",
    },
    {
      title: "Organic Chemistry Mastery",
      subject: "Chemistry",
      level: "Intermediate",
      students: "3,891",
      rating: 4.8,
      image: "🧪",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Molecular Biology & Genetics",
      subject: "Biology",
      level: "Advanced",
      students: "1,567",
      rating: 4.9,
      image: "🧬",
      gradient: "from-emerald-500/20 to-green-500/20",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Popular Courses</span>
          </div>
          <h3 className="text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">Start Learning Today</h3>
          <p className="text-lg lg:text-xl text-muted-foreground">Join thousands of students mastering science</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group rounded-2xl overflow-hidden bg-card border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div
                className={`h-48 bg-gradient-to-br ${course.gradient} relative overflow-hidden flex items-center justify-center border-b-2 border-border`}
              >
                <motion.span
                  whileHover={{ scale: 1.25, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-7xl"
                >
                  {course.image}
                </motion.span>
                <div className="absolute top-4 right-4 px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-sm font-semibold text-foreground border border-border">
                  {course.level}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    {course.subject}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-foreground">{course.rating}</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors text-pretty">
                  {course.title}
                </h4>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} students
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
