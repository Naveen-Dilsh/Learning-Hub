"use client"

import { useState } from "react"
import { Atom, User, Mail, Lock, ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await res.json()
      console.log(data)
      if (!res.ok) {
        setError(data.message || "Registration failed")
        console.log("fail")
        return
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        console.log("its okay")
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center shadow-xl hover:rotate-12 transition-transform duration-300">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-green-400">
                ScienceHub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Learn. Discover. Excel.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl xl:text-4xl font-black leading-tight text-slate-800 dark:text-slate-100">
              Join Our Science Community
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Start your journey with 50,000+ students mastering Physics, Chemistry, and Biology through interactive
              learning.
            </p>

            <div className="space-y-5 pt-4">
              {[
                {
                  icon: Check,
                  color: "from-blue-500 to-cyan-500",
                  title: "Expert Instructors",
                  desc: "Learn from PhDs and industry professionals",
                },
                {
                  icon: Check,
                  color: "from-purple-500 to-pink-500",
                  title: "Interactive Labs",
                  desc: "Hands-on virtual experiments and simulations",
                },
                {
                  icon: Check,
                  color: "from-green-500 to-emerald-500",
                  title: "Certified Learning",
                  desc: "Earn recognized certificates",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-base">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white dark:border-slate-700 p-6 sm:p-7 lg:p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6 group cursor-pointer justify-center">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center shadow-lg hover:rotate-12 transition-transform duration-300">
                <Atom className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ScienceHub
                </h1>
              </div>
            </div>

            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Get Started
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Create Account</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Start your science learning journey today</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs font-medium flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-7 pt-6 border-t-2 border-slate-100 dark:border-slate-700">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <Link href="/auth/signin">
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
