"use client"

import { Users, Zap, Award, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Expert Science Teachers",
      description: "Learn from PhDs and industry professionals with decades of research experience",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Zap,
      title: "Interactive Labs",
      description: "Hands-on virtual experiments and simulations for deeper understanding",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Award,
      title: "Certified Learning",
      description: "Earn recognized certificates that validate your science expertise",
      gradient: "from-emerald-500 to-emerald-600",
    },
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10"></div>
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Why Choose SmartLearn</span>
          </div>
          <h3 className="text-4xl lg:text-5xl font-black text-foreground mb-4 text-balance">
            Everything You Need to Excel
          </h3>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            State-of-the-art learning tools designed for the modern science student
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
