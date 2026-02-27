"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useToast } from "@/hooks/use-toast"
import { Lock, ArrowRight, Eye, EyeOff, GraduationCap, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [tokenError, setTokenError] = useState(false)

    useEffect(() => {
        if (!token) {
            setTokenError(true)
        }
    }, [token])

    const passwordsMatch = confirmPassword === "" || password === confirmPassword
    const isFormValid = password.length >= 6 && password === confirmPassword && token

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            if (!isFormValid) return
            setLoading(true)

            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password }),
                })

                const data = await res.json()

                if (res.ok) {
                    setSuccess(true)
                    // Auto-redirect after 3 seconds
                    setTimeout(() => router.push("/auth/signin"), 3000)
                } else {
                    if (res.status === 400) {
                        setTokenError(true)
                    }
                    toast({
                        variant: "destructive",
                        title: "Reset Failed",
                        description: data.message || "Something went wrong. Please try again.",
                    })
                }
            } catch {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Network error. Please check your connection and try again.",
                })
            } finally {
                setLoading(false)
            }
        },
        [token, password, isFormValid, router, toast]
    )

    return (
        <div className="h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">SmartLearn</h1>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
                    {success ? (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Password Reset!</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Your password has been updated successfully. Redirecting you to sign in...
                            </p>
                            <Link
                                href="/auth/signin"
                                className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 rounded-lg font-semibold text-sm active:scale-[0.98]"
                            >
                                Sign In Now
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : tokenError ? (
                        /* Invalid Token State */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Link Invalid or Expired</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
                            </p>
                            <Link
                                href="/auth/forgot-password"
                                className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 rounded-lg font-semibold text-sm active:scale-[0.98]"
                            >
                                Request New Link
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        /* Reset Form */
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Set New Password</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Choose a strong password for your account.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            autoFocus
                                            className="w-full pl-10 pr-10 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                                            placeholder="Minimum 6 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {password.length > 0 && password.length < 6 && (
                                        <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all ${!passwordsMatch && confirmPassword
                                                    ? "border-destructive focus:ring-destructive/30"
                                                    : "border-input"
                                                }`}
                                            placeholder="Repeat your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={showConfirm ? "Hide password" : "Show password"}
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {!passwordsMatch && confirmPassword && (
                                        <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !isFormValid}
                                    className="btn-primary w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <Link
                                    href="/auth/signin"
                                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Protected by enterprise-grade security
                </p>
            </div>
        </div>
    )
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
