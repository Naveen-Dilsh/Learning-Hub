"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages = {
    Callback: "There was an error with the callback URL.",
    OAuthSignin: "Error connecting to the OAuth provider.",
    OAuthCallback: "Error in the OAuth callback.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "There was an error with the callback.",
    EmailSignInError: "Email sign in failed.",
    CredentialsSignin: "Sign in failed. Check your credentials.",
    SessionCallback: "Session callback error.",
    Default: "An authentication error occurred.",
  }

  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
        <p className="text-foreground mb-6">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
