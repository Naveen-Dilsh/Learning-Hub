"use client"

import Navbar from "@/components/Home/Navbar"
import Footer from "@/components/Home/Footer"
import { FileText, User, BookOpen, CreditCard, Shield, AlertTriangle, Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Terms and Conditions</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              Welcome to <span className="font-semibold text-primary">SmartLearn</span>. These Terms and Conditions govern your use of our learning management platform and the enrollment and access to courses on our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any course enrollments or transactions.
            </p>
          </section>

          {/* Use of the Website Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Use of the Platform</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> You must be at least <span className="font-semibold">13 years old</span> to use our platform or enroll in courses. If you are under 18, you must have parental or guardian consent to use our services.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> You are responsible for maintaining the confidentiality of your account information, including your username and password. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> You agree to provide accurate, current, and complete information during the registration and enrollment process. You are responsible for keeping your account information up to date.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">d.</span> You may not use our platform for any unlawful or unauthorized purposes, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-6 mt-2">
                  <li>Sharing your account credentials with others</li>
                  <li>Attempting to access courses or content without proper enrollment</li>
                  <li>Downloading, copying, or distributing course materials without authorization</li>
                  <li>Interfering with or disrupting the platform's functionality</li>
                  <li>Using automated systems to access the platform</li>
                  <li>Engaging in any activity that violates intellectual property rights</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course Information and Pricing Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Course Information and Pricing</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> We strive to provide accurate course descriptions, content outlines, instructor information, and pricing. However, we do not guarantee the accuracy or completeness of such information. Course content may be updated or modified by instructors at any time.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> Course prices are subject to change without notice. Any promotions, discounts, or special offers are valid for a limited time and may be subject to additional terms and conditions. Prices displayed are in the currency specified and may vary by region.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> Course availability is subject to change. We reserve the right to discontinue or modify courses at any time. If a course you have enrolled in is discontinued, we will provide reasonable notice and may offer alternatives or refunds as appropriate.
                </p>
              </div>
            </div>
          </section>

          {/* Enrollment and Payments Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Enrollment and Payments</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> By enrolling in a course on our platform, you are making an offer to purchase access to that course. Enrollment is subject to payment verification and course availability.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> We reserve the right to refuse or cancel any enrollment for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-6 mt-2">
                  <li>Course availability or capacity limitations</li>
                  <li>Errors in pricing or course information</li>
                  <li>Suspected fraudulent activity or payment issues</li>
                  <li>Violation of these Terms and Conditions</li>
                  <li>Technical or administrative issues</li>
                </ul>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> You agree to provide valid and up-to-date payment information and authorize us to charge the total enrollment amount, including applicable taxes and fees, to your chosen payment method.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">d.</span> We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details. All payment transactions are subject to the terms and conditions of the payment processor.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">e.</span> Once payment is confirmed, you will gain immediate access to the enrolled course materials, subject to the course's availability and any scheduled start dates.
                </p>
              </div>
            </div>
          </section>

          {/* Course Access and Content Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Course Access and Content</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> Upon successful enrollment and payment, you will be granted access to the course materials for the duration specified in the course description, typically for lifetime access or as otherwise stated.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> Course access is personal and non-transferable. You may not share your account, course access, or course materials with others.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> Course content, including videos, documents, assessments, and other materials, is protected by copyright and intellectual property laws. You may not:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-6 mt-2">
                  <li>Download, copy, or distribute course materials without authorization</li>
                  <li>Record, screen capture, or reproduce course content</li>
                  <li>Share course materials with others or on public platforms</li>
                  <li>Use course content for commercial purposes</li>
                  <li>Reverse engineer or attempt to extract course content</li>
                </ul>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">d.</span> We reserve the right to revoke course access if you violate these terms or engage in any prohibited activities.
                </p>
              </div>
            </div>
          </section>

          {/* Certificates Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Certificates</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> Certificates of completion are issued upon successful completion of a course, as determined by the course requirements (e.g., watching all videos, completing assessments).
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> Certificates are issued in your name as registered on your account. You may not request certificates in names other than your registered account name.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> Certificates are for personal use and may not be used for fraudulent purposes or misrepresentation of qualifications.
                </p>
              </div>
            </div>
          </section>

          {/* Returns and Refunds Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Returns and Refunds</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                Our Refund Policy governs the process and conditions for requesting refunds for course enrollments. Please refer to our <Link href="/refund-policy" className="text-primary hover:underline font-semibold">Refund Policy</Link> for detailed information about eligibility, procedures, and timelines for refunds.
              </p>
            </div>
          </section>

          {/* Intellectual Property Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Intellectual Property</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> All content and materials on our platform, including but not limited to text, images, logos, graphics, videos, course content, and software, are protected by intellectual property rights and are the property of SmartLearn, its instructors, or its licensors.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> You may not use, reproduce, distribute, modify, create derivative works from, or publicly display any content from our platform without our prior written consent or the consent of the respective content owner.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> Course instructors retain ownership of their course content. By enrolling in a course, you are granted a limited, non-exclusive, non-transferable license to access and use the course content for personal, non-commercial educational purposes only.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">d.</span> Any unauthorized use of our platform's content may result in legal action and termination of your account.
                </p>
              </div>
            </div>
          </section>

          {/* User Conduct Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">User Conduct</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                You agree to use our platform in a respectful and lawful manner. Prohibited conduct includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-foreground ml-4">
                <li>Harassing, threatening, or abusing other users or instructors</li>
                <li>Posting offensive, defamatory, or inappropriate content</li>
                <li>Spamming or sending unsolicited communications</li>
                <li>Impersonating others or providing false information</li>
                <li>Attempting to gain unauthorized access to the platform or other users' accounts</li>
                <li>Interfering with the platform's security or functionality</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mt-3">
                We reserve the right to suspend or terminate accounts that violate these conduct guidelines.
              </p>
            </div>
          </section>

          {/* Limitation of Liability Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Limitation of Liability</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> In no event shall SmartLearn, its directors, employees, instructors, affiliates, or partners be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our platform, enrollment in courses, or the purchase and use of course content.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> We make no warranties or representations, express or implied, regarding:
                </p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-6 mt-2">
                  <li>The quality, accuracy, completeness, or suitability of courses offered on our platform</li>
                  <li>The uninterrupted or error-free operation of the platform</li>
                  <li>The accuracy of course descriptions or instructor qualifications</li>
                  <li>The availability of courses or platform features</li>
                  <li>The outcomes or results you may achieve from taking courses</li>
                </ul>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> Our total liability to you for any claims arising from your use of the platform shall not exceed the amount you paid for the specific course or service giving rise to the claim.
                </p>
              </div>
            </div>
          </section>

          {/* Indemnification Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Indemnification</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless SmartLearn, its officers, directors, employees, instructors, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or relating to your use of the platform, violation of these Terms and Conditions, or infringement of any rights of another party.
              </p>
            </div>
          </section>

          {/* Amendments and Termination Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Amendments and Termination</h2>
            </div>
            <div className="pl-8 space-y-3">
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">a.</span> We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">b.</span> Your continued use of our platform after any changes to these Terms and Conditions constitutes your acceptance of those changes.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">c.</span> We reserve the right to suspend or terminate your account and access to the platform at any time, with or without cause, including but not limited to violation of these Terms and Conditions, fraudulent activity, or non-payment.
                </p>
              </div>
              <div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-2">
                  <span className="font-semibold">d.</span> Upon termination, your right to access and use the platform will immediately cease. We may delete your account and associated data, subject to our data retention policies and legal obligations.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Governing Law</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-muted rounded-lg sm:rounded-xl p-6 sm:p-8 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Contact Us</h2>
            </div>
            <div className="pl-8 space-y-4">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us using the following information:
              </p>
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-semibold text-foreground">Contact Information:</p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4">
                  <li>Email: legal@smartlearn.com</li>
                  <li>Support Email: support@smartlearn.com</li>
                  <li>Help Center: <Link href="/student/help" className="text-primary hover:underline">Visit Help Center</Link></li>
                  <li>Response Time: We typically respond within 24-48 hours</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground italic">
              These Terms and Conditions are effective as of the date stated above. By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

