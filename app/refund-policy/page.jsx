"use client"

import Navbar from "@/components/Home/Navbar"
import Footer from "@/components/Home/Footer"
import { FileText, Clock, CreditCard, XCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[var(--hero-bg-start)]">
      <Navbar />

      {/* top spacing so navbar doesn't overlap */}
      <main className="pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--hero-text-secondary)] hover:text-[var(--hero-text-primary)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--hero-card-bg)] border border-[var(--hero-card-border)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--hero-gradient-start)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--hero-text-primary)]">
                  Refund Policy
                </h1>
                <p className="text-xs sm:text-sm text-[var(--hero-text-secondary)] mt-2">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-[var(--hero-card-bg)] rounded-xl sm:rounded-2xl border border-[var(--hero-card-border)] p-6 sm:p-8 lg:p-10 space-y-8 shadow-sm">
            {/* Introduction */}
            <section>
              <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                Thank you for choosing{" "}
                <span className="font-semibold text-[var(--hero-text-primary)]">e‑pencil academy</span>.
                We value your satisfaction and strive to provide you with the best online and physical learning
                experience possible. If, for any reason, you are not completely satisfied with your course purchase,
                we are here to help.
              </p>
            </section>

            {/* Returns Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Returns</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We accept refund requests within{" "}
                  <span className="font-semibold text-[var(--hero-text-primary)]">3 days</span> from the date of
                  purchase. To be eligible for a refund, you must not have completed more than{" "}
                  <span className="font-semibold text-[var(--hero-text-primary)]">10%</span> of the course content
                  (videos watched, assessments completed, etc.).
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Your refund request must include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Your order / payment ID</li>
                  <li>Reason for the refund request</li>
                  <li>Course name and purchase date</li>
                </ul>
              </div>
            </section>

            {/* Refunds Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Refunds</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Once we receive your refund request and verify your eligibility, we will notify you of the status
                  of your refund. If your refund is approved, we will initiate a refund to your original method of
                  payment.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Please note that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>The refund amount will be the full course price you paid.</li>
                  <li>Processing fees (if any) may be deducted from the refund amount.</li>
                  <li>Refunds are processed to the original payment method used during purchase.</li>
                </ul>
              </div>
            </section>

            {/* Course Exchanges Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Course Exchanges</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  If you would like to exchange your course enrollment for a different course of equal or higher
                  value, please contact our support team within{" "}
                  <span className="font-semibold text-[var(--hero-text-primary)]">7 days</span> of your purchase. We
                  will provide you with further instructions on how to proceed with the exchange.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  For exchanges to courses of higher value, you will be required to pay the price difference.
                </p>
              </div>
            </section>

            {/* Non-Refundable Items Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Non‑Refundable Items
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Certain items and situations are non‑refundable and non‑returnable. These include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Courses that have been completed (100% of content consumed).</li>
                  <li>Certificates that have been issued and downloaded.</li>
                  <li>Courses purchased more than 7 days ago.</li>
                  <li>Free courses or promotional courses.</li>
                  <li>
                    Courses purchased with gift cards or promotional codes (subject to terms of the promotion).
                  </li>
                  <li>Bundled course packages where one or more courses have been completed.</li>
                </ul>
              </div>
            </section>

            {/* Technical Issues Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Technical Issues or Defective Content
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  If you experience technical issues preventing you from accessing course content, or if the course
                  content is defective or incomplete, please contact us immediately. We will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Investigate the issue promptly.</li>
                  <li>Provide technical support to resolve the issue.</li>
                  <li>If the issue cannot be resolved, arrange for a full refund or course replacement.</li>
                  <li>Ensure you have access to a working alternative if available.</li>
                </ul>
              </div>
            </section>

            {/* Processing Time Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Processing Time</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Refunds and exchanges will be processed within{" "}
                  <span className="font-semibold text-[var(--hero-text-primary)]">5–7 business days</span> after we
                  approve your request. Please note that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>It may take additional time for the refund to appear, depending on your payment provider.</li>
                  <li>Credit card refunds typically take 5–10 business days to reflect in your statement.</li>
                  <li>Bank transfers may take 7–14 business days.</li>
                  <li>You will receive an email confirmation once the refund has been processed.</li>
                </ul>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-[var(--hero-bg-mid)]/40 rounded-lg sm:rounded-xl p-6 sm:p-8 border border-[var(--hero-card-border)]">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Contact Us</h2>
              </div>
              <div className="pl-0 sm:pl-4 space-y-4">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  If you have any questions or concerns regarding this refund policy, please contact our support
                  team. We are here to assist you and ensure your learning experience with us is enjoyable and
                  hassle‑free.
                </p>
                <div className="space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)]">
                  <p className="font-semibold text-[var(--hero-text-primary)]">Support Channels:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Email: support@epencil.lk</li>
                    <li>
                      Help Center:{" "}
                      <Link href="/student/help" className="text-[var(--hero-gradient-start)] hover:underline">
                        Visit Help Center
                      </Link>
                    </li>
                    <li>Response time: we typically respond within 24–48 hours.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="pt-6 border-t border-[var(--hero-card-border)]">
              <p className="text-xs sm:text-sm text-[var(--hero-text-secondary)] italic">
                {/* This refund policy is subject to change. We recommend reviewing this page periodically for any
                updates. Your continued use of our services after changes to this policy constitutes acceptance of
                those changes. */}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
