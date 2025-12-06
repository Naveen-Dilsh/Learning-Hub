"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("verifying")
  const [message, setMessage] = useState("")

  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (orderId) {
      verifyPayment()
    } else {
      setStatus("error")
      setMessage("No order ID found")
    }
  }, [orderId])

  const verifyPayment = async () => {
    try {
      const response = await fetch("/api/payhere/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Payment verified successfully!")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to verify payment")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while verifying payment")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              <CardTitle className="mt-4">Verifying Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <CardTitle className="mt-4 text-green-600">Payment Successful!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <CardTitle className="mt-4 text-red-600">Payment Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "success" && (
            <>
              <button asChild>
                <Link href={`/courses/${params.id}/watch`}>Start Learning</Link>
              </button>
              <button variant="outline" asChild>
                <Link href="/student/dashboard">Go to Dashboard</Link>
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <button onClick={verifyPayment}>Try Again</button>
              <button variant="outline" asChild>
                <Link href={`/courses/${params.id}`}>Back to Course</Link>
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
