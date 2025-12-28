"use client"

import Navbar from "@/components/Home/Navbar"
import Footer from "@/components/Home/Footer"
import { FileText, User, BookOpen, CreditCard, Shield, AlertTriangle, Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[var(--hero-bg-start)]">
      <Navbar />

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
                  Terms and Conditions
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
                Welcome to{" "}
                <span className="font-semibold text-[var(--hero-text-primary)]">
                  e‑pencil academy
                </span>
                . These Terms and Conditions govern your use of our learning platform and access to our classes and
                LMS. By using this website or enrolling in any course, you agree to these terms. Please read them
                carefully before proceeding.
              </p>
            </section>

            {/* Use of the Platform */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Use of the Platform
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> You must be at least{" "}
                  <span className="font-semibold text-[var(--hero-text-primary)]">13 years old</span> to use our
                  platform. Students under 18 should use the platform with the knowledge and consent of a parent,
                  guardian, or school.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">b.</span> You are responsible for keeping your login details
                  confidential and for all activity under your account. Notify us promptly if you suspect unauthorised
                  access.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">c.</span> You agree to provide accurate and up‑to‑date information
                  when creating an account or enrolling in courses.
                </p>
                <div>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mb-2">
                    <span className="font-semibold">d.</span> You must not use the platform for unlawful or
                    unauthorised purposes, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-4 mt-1">
                    <li>Sharing your account with others.</li>
                    <li>Accessing paid content without valid enrollment.</li>
                    <li>Copying, recording, or redistributing course materials.</li>
                    <li>Interfering with the security or performance of the platform.</li>
                    <li>Using bots or automated tools to access the LMS.</li>
                    <li>Infringing any copyright or intellectual property rights.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Course Information and Pricing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Course Information and Pricing
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> We aim to provide accurate details about each class and
                  course (syllabus, schedules, teachers, and pricing), but small changes may occur as content and
                  timetables are updated.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">b.</span> Prices may change over time due to promotions or updates.
                  The price you see at the time of enrollment is the price that applies to that purchase.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">c.</span> We may add, pause, or discontinue courses or batches. If a
                  course you have paid for is discontinued, we will try to offer a suitable alternative or follow our
                  refund policy.
                </p>
              </div>
            </section>

            {/* Enrollment and Payments */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Enrollment and Payments
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> Enrolling in a course is an offer to purchase access to that
                  course or batch, subject to payment confirmation and availability.
                </p>
                <div>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mb-2">
                    <span className="font-semibold">b.</span> We may cancel or refuse an enrollment in situations such
                    as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-4 mt-1">
                    <li>Class capacity limits or scheduling conflicts.</li>
                    <li>Errors in pricing or course information.</li>
                    <li>Suspected fraud or payment issues.</li>
                    <li>Violation of these Terms and Conditions.</li>
                  </ul>
                </div>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">c.</span> You authorise us or our payment partners to charge the
                  amount shown (including relevant taxes and fees) to your selected payment method.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">d.</span> Payments are processed through secure third‑party providers.
                  We do not store your full card details on our servers.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">e.</span> After successful payment, access to the relevant course,
                  batch, or LMS section will be activated as described on the course page.
                </p>
              </div>
            </section>

            {/* Course Access and Content */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Course Access and Content
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> Access duration (e.g., full year, term, or lifetime access
                  to recordings) will be clearly stated for each course.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">b.</span> Your course access is personal. You must not share login
                  details or content with others.
                </p>
                <div>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mb-2">
                    <span className="font-semibold">c.</span> All materials (videos, notes, questions, PDFs, LMS
                    content) are protected by copyright. You may not:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-4 mt-1">
                    <li>Download or redistribute recordings beyond what is clearly allowed.</li>
                    <li>Upload content to other websites, groups, or YouTube.</li>
                    <li>Sell, share, or publicly display any course materials.</li>
                  </ul>
                </div>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">d.</span> We may suspend or remove access if misuse or sharing of
                  content is detected.
                </p>
              </div>
            </section>

            {/* Certificates */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Certificates</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> If a course offers a certificate, it will be awarded based
                  on the completion rules shown (for example, minimum attendance or exam completion).
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">b.</span> Certificates will use the name on your account. Please make
                  sure it is correct.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">c.</span> Certificates must not be altered or used to misrepresent
                  your qualifications.
                </p>
              </div>
            </section>

            {/* Returns and Refunds */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Returns and Refunds
                </h2>
              </div>
              <div className="pl-4 sm:pl-8">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Refunds are handled according to our{" "}
                  <Link
                    href="/refund-policy"
                    className="text-[var(--hero-gradient-start)] hover:underline font-semibold"
                  >
                    Refund Policy
                  </Link>
                  . Please review it carefully before enrolling.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Intellectual Property
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">a.</span> All logos, designs, and teaching materials belong to
                  e‑pencil academy or our teachers and partners.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">b.</span> You receive a limited, personal, non‑transferable licence to
                  use the content for your own learning only.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  <span className="font-semibold">c.</span> Any unauthorised reuse, resale, or public sharing of
                  content may lead to account termination and legal action.
                </p>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  User Conduct
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  You agree to behave respectfully on our platform. You must not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-4">
                  <li>Harass or abuse teachers, staff, or other students.</li>
                  <li>Post offensive, hateful, or harmful content.</li>
                  <li>Send spam or unsolicited advertisements.</li>
                  <li>Pretend to be someone else or give false information.</li>
                  <li>Try to hack, bypass, or damage the platform or LMS.</li>
                </ul>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                  We may suspend or close accounts that break these rules.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Limitation of Liability
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Our classes and LMS are designed to support your studies, but exam results depend on many factors
                  (your effort, practice, etc.). We cannot guarantee specific grades or outcomes.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  To the fullest extent permitted by law, e‑pencil / Asā Hithena Science and its teachers will not be
                  responsible for indirect, incidental, or consequential losses arising from the use of the platform.
                  For any claim, our total liability will not exceed the amount you paid for the course concerned.
                </p>
              </div>
            </section>

            {/* Amendments and Termination */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Amendments and Termination
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We may update these Terms and Conditions from time to time. The updated version will be published on
                  this page with a new “Last updated” date.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Continued use of the platform after changes means you accept the new terms. We may also suspend or
                  terminate access where necessary, for example due to non‑payment, misuse, or legal reasons.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Governing Law
                </h2>
              </div>
              <div className="pl-4 sm:pl-8">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  These Terms and Conditions are governed by the laws of Sri Lanka (or your specified jurisdiction).
                  Any disputes will be handled by the competent courts of that jurisdiction.
                </p>
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
                  If you have questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)]">
                  <p className="font-semibold text-[var(--hero-text-primary)]">Contact information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Email: legal@epencilacademy.com</li>
                    <li>Support: support@epencilacademy.com</li>
                    <li>
                      Help Center:{" "}
                      <Link href="/student/help" className="text-[var(--hero-gradient-start)] hover:underline">
                        Visit Help Center
                      </Link>
                    </li>
                    <li>Typical response time: 24–48 hours.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="pt-6 border-t border-[var(--hero-card-border)]">
              <p className="text-xs sm:text-sm text-[var(--hero-text-secondary)] italic">
                By using our website, classes, or LMS, you confirm that you have read and understood these Terms and
                Conditions and agree to follow them. If you do not agree, please do not use the platform.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
