"use client"

import Link from "next/link"

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-destructive mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled. You can try again or browse other courses.
        </p>
        <div className="flex gap-4">
          <Link
            href="/courses"
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Browse Courses
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
