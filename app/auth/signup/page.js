"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function SignUp() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  // Memoized validation
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    )
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      })
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

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.message || "Failed to create account. Please try again.",
        })
        setLoading(false)
        return
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        toast({
          title: "Account Created",
          description: "Welcome! Your account has been created successfully.",
        })
        router.push("/student")
      } else {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: "Account created but automatic sign-in failed. Please sign in manually.",
        })
        router.push("/auth/signin")
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [formData, router, toast])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8 lg:p-8 pt-6 sm:pt-10 lg:pt-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Left Side - Branding (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between">
          {/* Top Section - Logo and Welcome */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">SmartLearn</h1>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">Learn. Discover. Excel.</p>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight text-foreground">
                Join Our Learning Community
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                Start your journey with thousands of students mastering new skills through interactive learning.
              </p>
            </div>
          </div>

          {/* GIF Section - Bottom aligned */}
          <div className="flex items-end justify-start pt-4">
            <div className="relative bg-muted-foreground dark:bg-transparent w-80 h-80 xl:w-96 xl:h-96 shadow-2xl dark:shadow-none rounded-2xl">
              <Image
                src="/images/signup-animation.gif"
                alt="Learning animation"
                fill
                className="object-contain rounded-2xl"
                unoptimized
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-card rounded-xl shadow-sm border border-border p-5 sm:p-6 lg:p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-5 sm:mb-6 justify-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">SmartLearn</h1>
            </div>

            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Create Account</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Start your learning journey today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && formData.password.length < 8 && (
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-primary w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 sm:mt-6 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border">
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
