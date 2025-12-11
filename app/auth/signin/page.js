"use client"

import { useState, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") || "/student", [searchParams])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const isFormValid = useMemo(() => {
    return email.trim() && password.length > 0
  }, [email, password])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setLoading(true)

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: result.error === "CredentialsSignin" ? "Invalid email or password" : result.error,
          })
        } else if (result?.ok) {
          toast({
            title: "Welcome Back",
            description: "You have been signed in successfully.",
          })
          
          // Fetch session to get user role for redirect
          const sessionResponse = await fetch("/api/auth/session")
          const session = await sessionResponse.json()
          const userRole = session?.user?.role

          // Redirect based on user role
          if (userRole === "ADMIN") {
            router.push("/instructor/enrollments/pending")
          } else if (userRole === "INSTRUCTOR") {
            router.push("/instructor/dashboard")
          } else {
            router.push(callbackUrl)
          }
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
    },
    [email, password, callbackUrl, router, toast],
  )

  const handleGoogleSignIn = useCallback(() => {
    signIn("google", { callbackUrl })
  }, [callbackUrl])

  return (
    <div className="h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
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
                Welcome Back
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                Sign in to continue your learning journey and access all your courses.
              </p>
            </div>
          </div>

          {/* GIF Section - Bottom aligned */}
          <div className="flex items-end justify-start pt-4">
            <div className="relative bg-muted-foreground dark:bg-transparent w-80 h-80 xl:w-96 xl:h-96 shadow-2xl dark:shadow-none rounded-2xl">
              <Image
                src="/images/signin-animation.gif"
                alt="Learning animation"
                fill
                className="object-contain rounded-2xl"
                unoptimized
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* Sign In Form */}
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
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Sign In</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-primary w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 sm:mt-6 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 sm:my-6 flex items-center">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-3 text-xs text-muted-foreground font-medium">Or continue with</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="btn-secondary w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-label="Google">
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
              <span>Sign in with Google</span>
            </button>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border">
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}
