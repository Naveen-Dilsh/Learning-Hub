"use client"

import { useState, useMemo } from "react"
import { Youtube, Plus, Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube"
import { useToast } from "@/hooks/use-toast"

export default function YouTubeVideoForm({ courseId, onUploadComplete }) {
  const { toast } = useToast()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationInput, setDurationInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const parsedVideoId = useMemo(() => extractYouTubeVideoId(youtubeUrl), [youtubeUrl])

  // Accepts "12:34" (mm:ss), "1:02:03" (hh:mm:ss) or plain seconds
  const parseDuration = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 0
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10)
    const parts = trimmed.split(":").map((p) => parseInt(p, 10))
    if (parts.some(isNaN)) return 0
    return parts.reduce((total, part) => total * 60 + part, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!parsedVideoId) {
      toast({
        title: "Invalid YouTube link",
        description: "Paste a valid YouTube video link (e.g. https://youtu.be/...)",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Enter a title for this video",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/courses/${courseId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          youtubeUrl: youtubeUrl.trim(),
          duration: parseDuration(durationInput),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to add video")
      }

      toast({
        title: "Video added",
        description: `"${data.title}" was added to the course`,
      })

      setYoutubeUrl("")
      setTitle("")
      setDescription("")
      setDurationInput("")

      if (onUploadComplete) {
        await onUploadComplete()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to add video",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-muted/50 to-primary/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Add YouTube Video</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Paste the link of an unlisted YouTube video
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* How-to instructions */}
        <div className="bg-muted border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Upload your video at{" "}
              <a
                href="https://studio.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                YouTube Studio <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Set visibility to <span className="font-semibold text-foreground">Unlisted</span>{" "}
              (not Private — private videos can't play here)
            </li>
            <li>Copy the video link and paste it below</li>
          </ol>
          <p className="pt-1">
            Unlisted videos don't appear in YouTube search or on your channel — only enrolled
            students see them here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              YouTube Link <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtu.be/dQw4w9WgXcQ"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
            />
            {youtubeUrl.trim() && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                {parsedVideoId ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Valid video link (ID: {parsedVideoId})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-destructive">Not a valid YouTube video link</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail preview */}
          {parsedVideoId && (
            <div className="flex items-center gap-3">
              <img
                src={getYouTubeThumbnailUrl(parsedVideoId, "mqdefault")}
                alt="Video thumbnail preview"
                className="w-32 sm:w-40 rounded-lg border border-border"
              />
              <p className="text-xs text-muted-foreground">Thumbnail preview from YouTube</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Video Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lesson 1: Introduction"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this lesson cover?"
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Duration <span className="text-muted-foreground font-normal">(optional, mm:ss)</span>
            </label>
            <input
              type="text"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              placeholder="e.g. 12:30"
              className="w-full sm:w-40 px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !parsedVideoId || !title.trim()}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Video to Course
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
