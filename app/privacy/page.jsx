"use client"

import Navbar from "@/components/Home/Navbar"
import Footer from "@/components/Home/Footer"
import { Shield, User, CreditCard, Eye, Lock, Cookie, FileText, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
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
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--hero-gradient-start)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--hero-text-primary)]">
                  Privacy Policy
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
                At{" "}
                <span className="font-semibold text-[var(--hero-text-primary)]">
                  e‑pencil academy
                </span>
                , we are committed to protecting the privacy and security of our learners. This Privacy Policy explains
                how we collect, use, and safeguard your information when you visit or use our learning platform. By
                using our website or LMS, you consent to the practices described in this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Information We Collect
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-4">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  When you use our website or LMS, we may collect the following types of information:
                </p>

                {/* Personal Identification */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-2">
                    Personal Identification Information
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                    Information you provide during registration, enrollment, or account creation, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-2">
                    <li>Name and contact information (email address, phone number).</li>
                    <li>Student ID or identification number.</li>
                    <li>Profile picture (if uploaded).</li>
                    <li>Address and location information (for physical materials or communication).</li>
                    <li>Educational background and learning preferences.</li>
                  </ul>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-2">
                    Payment and Billing Information
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                    Information needed to process payments and manage enrollments, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-2">
                    <li>Payment method details (e.g., card type, masked card number).</li>
                    <li>Billing address and transaction history.</li>
                    <li>Payment receipts and invoice references.</li>
                  </ul>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                    <span className="font-semibold text-[var(--hero-text-primary)]">Note:</span> Payments are processed
                    securely by trusted third‑party processors. We do not store your full card details on our servers.
                  </p>
                </div>

                {/* Learning data */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-2">
                    Learning and Usage Information
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                    Data generated while using our LMS, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-2">
                    <li>Course enrollment and completion status.</li>
                    <li>Video watch progress and attendance tracking.</li>
                    <li>Quiz and exam scores, assignments, and performance metrics.</li>
                    <li>Certificates earned and progress reports.</li>
                    <li>Time spent on lessons and platform usage patterns.</li>
                  </ul>
                </div>

                {/* Browsing */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-2">
                    Browsing Information
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                    Technical information collected automatically via cookies and similar technologies, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-2">
                    <li>IP address, device type, and browser information.</li>
                    <li>Operating system and language settings.</li>
                    <li>Pages viewed, buttons clicked, and time spent on each page.</li>
                    <li>Referring website or campaign links.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use of Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  How We Use Your Information
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Process enrollments and manage your classes and LMS access.</li>
                  <li>Communicate about schedules, course updates, and important announcements.</li>
                  <li>Provide technical support and respond to your questions.</li>
                  <li>Personalize your learning journey and recommend suitable courses.</li>
                  <li>Track progress, generate reports, and issue certificates.</li>
                  <li>Improve our website, LMS, and teaching based on usage analytics.</li>
                  <li>Send newsletters or promotions when you have given consent.</li>
                  <li>Prevent fraud, misuse, or unauthorized access to the platform.</li>
                  <li>Comply with legal requirements and enforce our terms and policies.</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Information Sharing
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We do not sell or rent your personal data. We may share information only in these situations:
                </p>

                <div className="space-y-3 mt-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-1">
                      Trusted Service Providers
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                      With third‑party partners who help us run our services, such as:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-1">
                      <li>Payment gateways and banks.</li>
                      <li>Cloud hosting and LMS infrastructure providers.</li>
                      <li>Email and SMS service providers.</li>
                      <li>Analytics tools to understand usage and improve the platform.</li>
                      <li>Delivery partners (if physical materials are sent).</li>
                    </ul>
                    <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                      These partners are required to protect your data and use it only for the purposes we specify.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-1">
                      Legal Requirements
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                      When required by law or to protect rights, we may share information in response to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2 mt-1">
                      <li>Court orders, subpoenas, or lawful requests by authorities.</li>
                      <li>Investigations into suspected fraud or illegal activity.</li>
                      <li>Situations involving safety of students, staff, or the public.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[var(--hero-text-primary)] mb-1">
                      Business Transfers
                    </h3>
                    <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                      If our business is merged, acquired, or restructured, your information may be transferred to the
                      new entity under the same privacy protections described here.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Data Security</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We use industry‑standard measures to protect your information from unauthorized access, loss, or
                  misuse, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Encrypted connections (SSL/TLS) for data in transit.</li>
                  <li>Secure storage and backups for important data.</li>
                  <li>Access controls and authentication for staff and systems.</li>
                  <li>Regular monitoring and basic security reviews.</li>
                  <li>Staff awareness on privacy and data protection practices.</li>
                </ul>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                  No system can be 100% secure, so we also encourage you to use strong passwords and keep your login
                  details private.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Cookies and Tracking
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We use cookies and similar technologies to keep you logged in, remember preferences, and understand
                  how students use the site. These may include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>
                    <span className="font-semibold text-[var(--hero-text-primary)]">Essential cookies</span> for login,
                    security, and basic features.
                  </li>
                  <li>
                    <span className="font-semibold text-[var(--hero-text-primary)]">Analytics cookies</span> to measure
                    traffic and improve the experience.
                  </li>
                  <li>
                    <span className="font-semibold text-[var(--hero-text-primary)]">Preference cookies</span> to
                    remember language, theme, or other settings.
                  </li>
                  <li>
                    <span className="font-semibold text-[var(--hero-text-primary)]">Marketing cookies</span> when we run
                    campaigns (used only with appropriate consent).
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                  You can control cookies through your browser settings. Disabling some cookies may affect certain
                  features, such as staying signed in.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">Your Rights</h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Depending on your location, you may have rights to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)] ml-2">
                  <li>Access the personal data we hold about you.</li>
                  <li>Request correction of inaccurate or incomplete data.</li>
                  <li>Request deletion of your data where legally allowed.</li>
                  <li>Request a copy of your data in a portable format.</li>
                  <li>Object to or restrict certain types of processing.</li>
                  <li>Opt out of marketing emails at any time.</li>
                </ul>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed mt-2">
                  To exercise any of these rights, please contact us using the details in the Contact Us section.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Children’s Privacy
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Our platform is intended for students using it with the knowledge of a parent, guardian, or school.
                  We do not knowingly collect personal information from children below the applicable age of consent
                  without appropriate permission. If you believe we have collected such data in error, please contact
                  us and we will remove it.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--hero-gradient-start)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--hero-text-primary)]">
                  Changes to this Policy
                </h2>
              </div>
              <div className="pl-4 sm:pl-8 space-y-3">
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our services, legal
                  requirements, or best practices. The “Last updated” date at the top will indicate the latest version.
                </p>
                <p className="text-sm sm:text-base text-[var(--hero-text-secondary)] leading-relaxed">
                  Significant changes may be communicated via email or a clear notice on our website or LMS. Your
                  continued use of our services after changes are posted means you accept the updated policy.
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
                  If you have questions or concerns about this Privacy Policy or how we handle your information, please
                  contact us:
                </p>
                <div className="space-y-2 text-sm sm:text-base text-[var(--hero-text-secondary)]">
                  <p className="font-semibold text-[var(--hero-text-primary)]">Contact information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Email: privacy@epencilacademy.com</li>
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
                By using our website, classes, or LMS, you confirm that you have read and understood this Privacy
                Policy and agree to the collection and use of information as described above.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
