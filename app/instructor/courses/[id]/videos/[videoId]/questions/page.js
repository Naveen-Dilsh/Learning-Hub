"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ArrowLeft, MessageCircleQuestion, Plus, Trash2, Save, Loader2, CheckCircle2, Clock,
} from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import { useToast } from "@/hooks/use-toast"

const emptyQuestion = () => ({
  text: "",
  options: ["", ""],
  correctIndex: 0,
  triggerDisplay: "", // mm:ss shown to the instructor; blank = auto-spaced
})

function secondsToDisplay(seconds) {
  if (seconds === null || seconds === undefined) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function displayToSeconds(display) {
  const trimmed = (display || "").trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10)
  const parts = trimmed.split(":").map((p) => parseInt(p, 10))
  if (parts.some(isNaN)) return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}

export default function ManageVideoQuestions() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [videoTitle, setVideoTitle] = useState("")
  const [questions, setQuestions] = useState([])

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
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/videos/${params.videoId}/questions`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to load questions")

        setVideoTitle(data.videoTitle || "")
        setQuestions(
          (data.questions || []).map((q) => ({
            text: q.text,
            options: [...q.options],
            correctIndex: q.correctIndex,
            triggerDisplay: secondsToDisplay(q.triggerTime),
          }))
        )
      } catch (err) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (params.videoId && status === "authenticated") fetchQuestions()
  }, [params.videoId, status, toast])

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

  const handleSave = async () => {
    // Validate trigger times client-side for a friendly message
    for (let i = 0; i < questions.length; i++) {
      const t = questions[i].triggerDisplay.trim()
      if (t && displayToSeconds(t) === null) {
        toast({
          title: "Invalid time",
          description: `Question ${i + 1}: use mm:ss format (e.g. 2:30) or leave empty`,
          variant: "destructive",
        })
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/videos/${params.videoId}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            triggerTime: displayToSeconds(q.triggerDisplay),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save questions")

      toast({
        title: "Saved",
        description:
          questions.length === 0
            ? "All checkpoint questions removed for this video"
            : `${questions.length} checkpoint ${questions.length === 1 ? "question" : "questions"} saved`,
      })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) return <LoadingBubbles />

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href={`/instructor/courses/${params.id}/videos`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Videos</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircleQuestion className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">In-Video Questions</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{videoTitle}</p>
          </div>
        </div>

        <div className="bg-muted border border-border rounded-xl p-4 mb-6 text-sm text-muted-foreground space-y-1">
          <p>
            The video <span className="font-semibold text-foreground">pauses</span> at each question
            and only continues after the student answers <span className="font-semibold text-foreground">correctly</span>.
          </p>
          <p>
            Set a show time (mm:ss) per question, or leave it empty to spread questions evenly
            across the video. Careful: <span className="font-semibold text-foreground">1:30 means 1 minute 30 seconds</span> —
            if the time is longer than the video, the question shows near the end.
          </p>
        </div>

        {questions.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center mb-6">
            <p className="text-foreground font-semibold mb-1">No questions yet</p>
            <p className="text-sm text-muted-foreground">
              Add a question below — 3 per video works great!
            </p>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-foreground">Question {qIndex + 1}</h3>
                <button
                  onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition"
                  title="Remove question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                placeholder="Type the question..."
                rows={2}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground resize-none mb-3"
              />

              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm text-muted-foreground">Show at</label>
                <input
                  type="text"
                  value={q.triggerDisplay}
                  onChange={(e) => updateQuestion(qIndex, { triggerDisplay: e.target.value })}
                  placeholder="auto"
                  className="w-24 px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">mm:ss — empty = auto</span>
              </div>

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
                        onClick={() =>
                          setQuestions((prev) =>
                            prev.map((qq, i) => {
                              if (i !== qIndex) return qq
                              const options = qq.options.filter((_, j) => j !== oIndex)
                              let correctIndex = qq.correctIndex
                              if (correctIndex === oIndex) correctIndex = 0
                              else if (correctIndex > oIndex) correctIndex -= 1
                              return { ...qq, options, correctIndex }
                            })
                          )
                        }
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
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.map((qq, i) =>
                        i === qIndex ? { ...qq, options: [...qq.options, ""] } : qq
                      )
                    )
                  }
                  className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add option
                </button>
              )}
            </div>
          ))}
        </div>

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
            {saving ? "Saving..." : "Save Questions"}
          </button>
        </div>
      </div>
    </div>
  )
}
