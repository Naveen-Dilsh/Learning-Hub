"use client"

import Navbar from "@/components/Home/Navbar"
import Footer from "@/components/Home/Footer"
import { Shield, User, CreditCard, Eye, Lock, Cookie, FileText, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              At <span className="font-semibold text-primary">SmartLearn</span>, we are committed to protecting the privacy and security of our users' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or use our learning management platform. By using our website, you consent to the practices described in this policy.
            </p>
          </section>

          {/* Information We Collect Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Information We Collect</h2>
            </div>
            <div className="pl-8 space-y-4">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                When you visit our website or use our platform, we may collect certain information about you, including:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Personal Identification Information</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    Information provided voluntarily by you during registration, enrollment, or account creation, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Student number or identification</li>
                    <li>Profile picture (if uploaded)</li>
                    <li>Address and location information (for course material deliveries)</li>
                    <li>Educational background and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Payment and Billing Information</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    Information necessary to process your course enrollments and payments, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>Payment method details (credit card, bank account, etc.)</li>
                    <li>Billing address and transaction history</li>
                    <li>Payment receipts and invoices</li>
                  </ul>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed mt-2">
                    <span className="font-semibold">Note:</span> All payment information is securely handled by trusted third-party payment processors. We do not store your complete credit card details on our servers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Learning and Usage Information</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    Information collected automatically about your use of our platform, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>Course enrollment and completion data</li>
                    <li>Video watch progress and completion status</li>
                    <li>Assessment scores and performance metrics</li>
                    <li>Certificates earned</li>
                    <li>Time spent on courses and platform usage patterns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Browsing Information</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    Technical information collected automatically using cookies and similar technologies, such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Use of Information Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Use of Information</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We may use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-foreground ml-4">
                <li>To process and fulfill your course enrollments and manage your learning journey</li>
                <li>To communicate with you regarding your enrollments, course updates, certificates, and provide customer support</li>
                <li>To respond to your inquiries, requests, and provide technical assistance</li>
                <li>To personalize your learning experience and recommend relevant courses based on your interests and progress</li>
                <li>To track your progress, issue certificates upon course completion, and maintain your academic records</li>
                <li>To improve our platform, courses, and services based on your feedback and usage patterns</li>
                <li>To send you important updates, newsletters, and promotional materials (with your consent)</li>
                <li>To detect and prevent fraud, unauthorized access, and abuse of our platform</li>
                <li>To comply with legal obligations and enforce our terms of service</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Information Sharing</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              
              <div className="space-y-3 mt-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Trusted Service Providers</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    We may share your information with third-party service providers who assist us in operating our platform, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>Payment processors for handling transactions</li>
                    <li>Cloud storage providers for hosting course content and data</li>
                    <li>Email service providers for sending notifications and communications</li>
                    <li>Analytics services to understand platform usage and improve our services</li>
                    <li>Delivery services for course material shipments</li>
                  </ul>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed mt-2">
                    These providers are contractually obligated to handle your data securely and confidentially, and they are only permitted to use your information for the specific purposes we authorize.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Legal Requirements</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    We may disclose your information if required to do so by law or in response to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4 mt-2">
                    <li>Valid legal requests, court orders, or subpoenas</li>
                    <li>Government investigations or regulatory requirements</li>
                    <li>Protection of our rights, property, or safety, or that of our users</li>
                    <li>Prevention of fraud or illegal activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Business Transfers</h3>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections outlined in this policy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Security Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Data Security</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security practices include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-foreground ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Secure storage of data at rest with encryption</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Employee training on data protection and privacy</li>
              </ul>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mt-3">
                However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security. We encourage you to use strong passwords and keep your account credentials confidential.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking Technologies Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Cookies and Tracking Technologies</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our platform. Types of cookies we use include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-foreground ml-4">
                <li><span className="font-semibold">Essential Cookies:</span> Required for the platform to function properly, such as authentication and session management</li>
                <li><span className="font-semibold">Analytics Cookies:</span> Help us understand how visitors interact with our platform to improve user experience</li>
                <li><span className="font-semibold">Preference Cookies:</span> Remember your settings and preferences for a personalized experience</li>
                <li><span className="font-semibold">Marketing Cookies:</span> Used to deliver relevant advertisements and track campaign effectiveness (with your consent)</li>
              </ul>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mt-3">
                You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our platform, such as staying logged in or personalized course recommendations.
              </p>
            </div>
          </section>

          {/* Your Rights Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Your Rights</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-foreground ml-4">
                <li><span className="font-semibold">Access:</span> Request access to your personal information we hold</li>
                <li><span className="font-semibold">Correction:</span> Request correction of inaccurate or incomplete information</li>
                <li><span className="font-semibold">Deletion:</span> Request deletion of your personal information (subject to legal and contractual obligations)</li>
                <li><span className="font-semibold">Portability:</span> Request a copy of your data in a portable format</li>
                <li><span className="font-semibold">Opt-out:</span> Unsubscribe from marketing communications at any time</li>
                <li><span className="font-semibold">Objection:</span> Object to certain processing of your personal information</li>
              </ul>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mt-3">
                To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>
          </section>

          {/* Children's Privacy Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Children's Privacy</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                Our platform is not intended for children under the age of 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Changes to the Privacy Policy</h2>
            </div>
            <div className="pl-8 space-y-3">
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We reserve the right to update or modify this Privacy Policy at any time to reflect changes in our practices, technology, legal requirements, or other factors. Any changes will be posted on this page with a revised "last updated" date.
              </p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information. Your continued use of our platform after any changes to this Privacy Policy constitutes your acceptance of those changes.
              </p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                If we make material changes to this Privacy Policy, we will notify you through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4">
                <li>Email notification to the address associated with your account</li>
                <li>Prominent notice on our platform</li>
                <li>Other communication methods as appropriate</li>
              </ul>
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
                If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please contact us using the following information:
              </p>
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-semibold text-foreground">Contact Information:</p>
                <ul className="list-disc list-inside space-y-1 text-base sm:text-lg text-foreground ml-4">
                  <li>Email: privacy@smartlearn.com</li>
                  <li>Support Email: support@smartlearn.com</li>
                  <li>Help Center: <Link href="/student/help" className="text-primary hover:underline">Visit Help Center</Link></li>
                  <li>Response Time: We typically respond within 24-48 hours</li>
                </ul>
              </div>
              <p className="text-base sm:text-lg text-foreground leading-relaxed mt-4">
                We are committed to addressing your privacy concerns and will respond to your inquiries in a timely and professional manner.
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground italic">
              This Privacy Policy is effective as of the date stated above and applies to all information collected by SmartLearn. By using our platform, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

