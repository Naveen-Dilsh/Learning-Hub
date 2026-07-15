"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ArrowLeft, GraduationCap, Plus, Trash2, Save, Loader2, CheckCircle2, AlertTriangle,
} from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import { useToast } from "@/hooks/use-toast"

const emptyQuestion = () => ({
  text: "",
  options: ["", ""],
  correctIndex: 0,
})

export default function ManageQuiz() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseTitle, setCourseTitle] = useState("")
  const [title, setTitle] = useState("Final Quiz")
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      } else if (session?.user?.role !== "INSTRUCTOR") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/courses/${params.id}/quiz`, { cache: "no-store" })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || "Failed to load quiz")

        setCourseTitle(data.courseTitle || "")

        if (data.quiz) {
          setHasExistingQuiz(true)
          setTitle(data.quiz.title)
          setPassingScore(data.quiz.passingScore)
          setQuestions(
            data.quiz.questions.map((q) => ({
              text: q.text,
              options: [...q.options],
              correctIndex: q.correctIndex,
            }))
          )
        }
      } catch (err) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (params.id && status === "authenticated") fetchQuiz()
  }, [params.id, status, toast])

  const updateQuestion = useCallback((index, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }, [])

  const updateOption = useCallback((qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) }
          : q
      )
    )
  }, [])

  const addOption = useCallback((qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length < 6 ? { ...q, options: [...q.options, ""] } : q
      )
    )
  }, [])

  const removeOption = useCallback((qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q
        const options = q.options.filter((_, j) => j !== oIndex)
        let correctIndex = q.correctIndex
        if (correctIndex === oIndex) correctIndex = 0
        else if (correctIndex > oIndex) correctIndex -= 1
        return { ...q, options, correctIndex }
      })
    )
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${params.id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, passingScore, questions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save quiz")

      setHasExistingQuiz(true)
      toast({ title: "Quiz saved", description: "Students must now pass it to earn the certificate" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}/quiz`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to delete quiz")
      }
      setHasExistingQuiz(false)
      setTitle("Final Quiz")
      setPassingScore(70)
      setQuestions([emptyQuestion()])
      setDeleteConfirm(false)
      toast({ title: "Quiz deleted", description: "Certificates now only require watching all videos" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  if (status === "loading" || loading) return <LoadingBubbles />

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <Link
          href={`/instructor/courses/${params.id}/videos`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Videos</span>
        </Link>

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Final Quiz</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{courseTitle}</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-muted border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground">
          Students must pass this quiz (after watching all videos) to earn their certificate.
          If no quiz exists, certificates only require watching all videos.
        </div>

        {/* Quiz settings */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 sm:space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-foreground">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                placeholder="Type the question..."
                rows={2}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground resize-none mb-4"
              />

              <p className="text-xs text-muted-foreground mb-2">
                Options — click the circle to mark the correct answer ✓
              </p>

              <div className="space-y-2">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        q.correctIndex === oIndex
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border text-transparent hover:border-emerald-400"
                      }`}
                      title="Mark as correct answer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {q.options.length < 6 && (
                <button
                  onClick={() => addOption(qIndex)}
                  className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add option
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Question
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5" />}
            {saving ? "Saving..." : "Save Quiz"}
          </button>

          {hasExistingQuiz && (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="btn-danger flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base sm:ml-auto"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Delete Quiz
            </button>
          )}
        </div>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Delete Quiz?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                All questions and student attempts will be removed. Certificates will only require
                watching all videos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="btn-secondary flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
