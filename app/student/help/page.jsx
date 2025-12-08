"use client"

import { ChevronDown, HelpCircle, Mail, MessageCircle, BookOpen, Shield, CreditCard, Award, Video, Clock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer:
        "Browse courses from the 'Browse Courses' section, click 'Enroll Now' on your desired course, complete the payment process, and you'll have instant access to all course materials including videos, resources, and live sessions.",
      icon: BookOpen,
      category: "Enrollment",
    },
    {
      question: "Can I download course materials?",
      answer:
        "Videos are streamed online for the best viewing experience. However, instructors may provide downloadable resources such as PDFs, documents, and other materials in the course resources section. Check each course's resources tab for available downloads.",
      icon: BookOpen,
      category: "Materials",
    },
    {
      question: "What if I need a refund?",
      answer: "We offer a 7-day refund policy from the date of purchase. If you're not satisfied with your course, contact our support team with your payment details and reason for refund. We'll process your request within 2-3 business days.",
      icon: CreditCard,
      category: "Payments",
    },
    {
      question: "How do I get a certificate?",
      answer:
        "Upon completing a course (watching all videos and passing any assessments), you'll automatically receive a certificate. You can download it from the 'Certificates' section in your dashboard. Certificates are issued instantly upon course completion.",
      icon: Award,
      category: "Certificates",
    },
    {
      question: "Can I contact instructors?",
      answer:
        "Yes! You can interact with instructors through the course Q&A section, participate in live sessions, or contact our support team for direct assistance. Instructors are typically responsive within 24-48 hours.",
      icon: MessageCircle,
      category: "Communication",
    },
    {
      question: "Is my account secure?",
      answer: "Yes, we use industry-standard encryption (SSL/TLS) and security measures to protect your personal information and payment details. All data is encrypted in transit and at rest. We never share your information with third parties.",
      icon: Shield,
      category: "Security",
    },
    {
      question: "How do live sessions work?",
      answer:
        "Live sessions are scheduled by instructors and appear in your 'Live Sessions' section. You'll receive notifications before sessions start. Join sessions on time to interact with instructors and other students in real-time. Recordings may be available after the session.",
      icon: Video,
      category: "Live Sessions",
    },
    {
      question: "What is the refund policy?",
      answer:
        "We offer a 7-day money-back guarantee from the date of purchase. Refunds are processed to your original payment method within 5-7 business days. Contact support with your order ID to initiate a refund request.",
      icon: Clock,
      category: "Payments",
    },
  ]

  const quickLinks = [
    { href: "/student/courses", label: "My Courses", icon: BookOpen },
    { href: "/student/browse-course", label: "Browse Courses", icon: BookOpen },
    { href: "/student/payments", label: "Payment History", icon: CreditCard },
    { href: "/student/certificates", label: "My Certificates", icon: Award },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-background">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 lg:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Help & Support
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Find answers to common questions and get assistance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition">
                <link.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition">
                {link.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">
          Frequently Asked Questions
        </h2>
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {faqs.map((faq, index) => {
              const Icon = faq.icon
              const isExpanded = expandedFaq === index
              return (
                <div key={index} className="transition-all">
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm sm:text-base text-foreground block group-hover:text-primary transition">
                          {faq.question}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 block">{faq.category}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-4 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-5 pt-0 bg-muted/30 animate-in slide-in-from-top-2 duration-200">
                      <div className="pl-14 sm:pl-16">
                        <p className="text-sm sm:text-base text-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Still need help?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Our support team is here to help you. Contact us for any questions, issues, or feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="mailto:support@learnhub.com"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-medium active:scale-[0.98] transition"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Support
              </a>
              <Link
                href="/student/settings"
                className="bg-card border border-border hover:border-primary/50 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm sm:text-base font-medium text-foreground hover:bg-muted transition active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Response Time</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We typically respond within 24-48 hours during business days.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-chart-4" />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Secure Support</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All communications are encrypted and secure for your privacy.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <div className="w-10 h-10 bg-chart-5/10 rounded-lg flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5 text-chart-5" />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">24/7 Resources</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Access help articles and FAQs anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
