"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPassword() {
    const { toast } = useToast()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            if (!email.trim()) return
            setLoading(true)

            try {
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                })

                // Always show success regardless of response (no email enumeration)
                if (res.ok || res.status === 500) {
                    setSubmitted(true)
                } else {
                    const data = await res.json()
                    toast({
                        variant: "destructive",
                        title: "Error",
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
        [email, toast]
    )

    return (
        <div className="h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            <div className="w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="relative w-11 h-11 flex-shrink-0">
                        <Image src="/images/logo.png" alt="ePencil Academy" fill className="object-contain" priority />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">ePencil Academy</h1>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
                    {submitted ? (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Check Your Inbox</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                If an account exists for <span className="font-semibold text-foreground">{email}</span>,
                                we&apos;ve sent a password reset link. It expires in <strong>1 hour</strong>.
                            </p>
                            <p className="text-xs text-muted-foreground mb-6">
                                Didn&apos;t receive it? Check your spam folder or try again in a few minutes.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { setSubmitted(false); setEmail("") }}
                                    className="btn-secondary w-full py-2.5 px-4 rounded-lg font-semibold text-sm"
                                >
                                    Try a different email
                                </button>
                                <Link
                                    href="/auth/signin"
                                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Forgot Password?</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Enter your email address and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                            className="w-full pl-10 pr-3 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="btn-primary w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-border">
                                <Link
                                    href="/auth/signin"
                                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
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
