"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  ArrowLeft, GraduationCap, Loader2, CheckCircle2, XCircle, Award, RotateCcw,
} from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import { useToast } from "@/hooks/use-toast"

export default function CourseQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [courseTitle, setCourseTitle] = useState("")
  const [bestAttempt, setBestAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [certificateEarned, setCertificateEarned] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/courses/${params.id}/quiz`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || "Failed to load quiz")

        setQuiz(data.quiz)
        setCourseTitle(data.courseTitle || "")
        setBestAttempt(data.bestAttempt || null)
      } catch (err) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (params.id && status === "authenticated") fetchQuiz()
  }, [params.id, status, toast])

  const allAnswered = quiz && quiz.questions.every((q, i) => answers[i] !== undefined)

  const claimCertificate = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}/complete`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.completed) {
        setCertificateEarned(true)
        queryClient.invalidateQueries({ queryKey: ["certificates"] })
        queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      }
    } catch (err) {
      // Certificate can still be claimed later from the watch page
      console.error("Error claiming certificate:", err)
    }
  }

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast({
        title: "Not finished",
        description: "Please answer every question before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/courses/${params.id}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: quiz.questions.map((_, i) => answers[i]),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to submit quiz")

      setResult(data)

      if (data.passed) {
        // Try to issue the certificate right away (works if all videos are done)
        await claimCertificate()
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswers({})
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (status === "loading" || loading) return <LoadingBubbles />

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href={`/student/browse-course/${params.id}/watch`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Course</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {quiz?.title || "Final Quiz"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">{courseTitle}</p>
          </div>
        </div>

        {/* No quiz */}
        {!quiz && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-foreground font-semibold mb-2">This course has no quiz</p>
            <p className="text-sm text-muted-foreground">
              Complete all videos to earn your certificate.
            </p>
          </div>
        )}

        {/* Already passed */}
        {quiz && !result && bestAttempt?.passed && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-6 mb-6 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-foreground">
                You already passed with {bestAttempt.score}%! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                You can retake the quiz for fun, but your certificate is safe.
              </p>
            </div>
          </div>
        )}

        {/* Result screen */}
        {result && (
          <div
            className={`rounded-2xl border p-8 text-center mb-6 ${
              result.passed
                ? "bg-emerald-500/10 border-emerald-500/40"
                : "bg-destructive/10 border-destructive/40"
            }`}
          >
            {result.passed ? (
              <Award className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold text-foreground mb-2">{result.score}%</h2>
            <p className="text-foreground font-semibold mb-1">
              {result.correctCount} / {result.totalQuestions} correct
              {" · "}pass mark {result.passingScore}%
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {result.passed
                ? "Congratulations, you passed! 🎉"
                : "Not this time — review the lessons and try again. You have unlimited attempts!"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.passed ? (
                certificateEarned ? (
                  <Link
                    href="/student/certificates"
                    className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    View Your Certificate
                  </Link>
                ) : (
                  <Link
                    href={`/student/browse-course/${params.id}/watch`}
                    className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                  >
                    Back to Course
                  </Link>
                )
              ) : (
                <>
                  <button
                    onClick={handleRetry}
                    className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                  <Link
                    href={`/student/browse-course/${params.id}/watch`}
                    className="btn-secondary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center"
                  >
                    Review Lessons
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Questions */}
        {quiz && !result && (
          <>
            <div className="bg-muted border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground">
              {quiz.questions.length} questions · pass mark {quiz.passingScore}% · unlimited attempts
            </div>

            <div className="space-y-4 sm:space-y-6">
              {quiz.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6"
                >
                  <p className="font-semibold text-foreground mb-4">
                    {qIndex + 1}. {q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition ${
                          answers[qIndex] === oIndex
                            ? "border-primary bg-primary/10 text-foreground font-semibold"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                            answers[qIndex] === oIndex
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        />
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !allAnswered}
              className="btn-primary w-full mt-6 px-6 py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Checking...
                </>
              ) : allAnswered ? (
                "Submit Answers"
              ) : (
                `Answer all questions (${Object.keys(answers).length}/${quiz.questions.length})`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
