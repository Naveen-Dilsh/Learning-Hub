"use client"

import { ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 text-balance">
            Ready to Begin Your Science Journey?
          </h3>
          <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join 50,000+ students learning from world-class science educators. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Start Learning Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Schedule a Demo
            </motion.button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 pt-10 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="text-white text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="text-white text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-300" />
              <span className="text-white text-sm">Full access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
