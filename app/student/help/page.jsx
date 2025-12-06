"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export default function Help() {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer:
        "Browse courses, click 'Enroll Now', complete the payment, and you'll have instant access to the course materials.",
    },
    {
      question: "Can I download course materials?",
      answer:
        "Videos can be streamed online. Some instructors may provide downloadable resources in the course materials section.",
    },
    {
      question: "What if I need a refund?",
      answer: "We offer a 7-day refund policy from the date of purchase. Contact our support team for assistance.",
    },
    {
      question: "How do I get a certificate?",
      answer:
        "Upon completing a course (watching all videos and passing any assessments), you'll automatically receive a certificate.",
    },
    {
      question: "Can I contact instructors?",
      answer:
        "Yes, you can message instructors through the course Q&A section or contact support for direct assistance.",
    },
    {
      question: "Is my account secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your personal information.",
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
      <p className="text-gray-600 mb-8">Find answers to common questions</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-3xl">
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}
                />
              </button>
              {expandedFaq === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
        <p className="text-gray-700 mb-4">Contact our support team for further assistance</p>
        <a
          href="mailto:support@learnhub.com"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
