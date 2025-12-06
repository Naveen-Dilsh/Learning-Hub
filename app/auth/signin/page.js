"use client"

import { useState } from "react"
import { Atom, Mail, Lock, ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const callbackUrl = searchParams.get("callbackUrl") || "/student"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
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
              Welcome Back to Learning
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Continue your journey with 50,000+ students mastering Physics, Chemistry, and Biology through interactive
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

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white dark:border-slate-700 p-6 sm:p-7 lg:p-8">
            <div className="lg:hidden flex items-center gap-2 mb-6 group cursor-pointer justify-center">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 flex items-center justify-center shadow-lg hover:rotate-12 transition-transform duration-300">
                <Atom className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  ScienceHub
                </h1>
              </div>
            </div>

            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Sign In</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Continue your science learning journey</p>
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t-2 border-slate-200 dark:border-slate-700"></div>
              <span className="px-3 text-xs text-slate-500 dark:text-slate-400 font-medium">Or continue with</span>
              <div className="flex-1 border-t-2 border-slate-200 dark:border-slate-700"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-5 border-2 border-slate-200 dark:border-slate-600 rounded-lg font-semibold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                Sign in with Google
              </span>
            </button>

            <div className="mt-7 pt-6 border-t-2 border-slate-100 dark:border-slate-700">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}
