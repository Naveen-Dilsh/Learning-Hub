"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useVideoStore } from "@/lib/stores"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

// Load the YouTube IFrame Player API once and share the promise across players
let youtubeApiPromise = null
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"))
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") previousCallback()
      resolve(window.YT)
    }

    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    script.async = true
    script.onerror = () => reject(new Error("Failed to load YouTube player"))
    document.body.appendChild(script)
  })

  return youtubeApiPromise
}

function formatTime(seconds) {
  if (!seconds || seconds < 0 || !isFinite(seconds)) return "0:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function VideoPlayer({ videoId, courseId, videoTitle, userName, userId }) {
  const [youtubeVideoId, setYoutubeVideoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 10, y: 10 })

  // Custom player controls state
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  // Masks that hide YouTube's title/logo overlays while they are visible
  // (YouTube shows them for a few seconds after play/seek, then fades them)
  const [maskVisible, setMaskVisible] = useState(true)
  const maskTimeoutRef = useRef(null)

  // In-video checkpoint questions: the video pauses at each one and only
  // resumes after the student answers correctly
  const checkpointsRef = useRef([])
  const activeCheckpointRef = useRef(null)
  const [activeCheckpoint, setActiveCheckpoint] = useState(null)
  const [checkpointWrong, setCheckpointWrong] = useState(false)
  const [checkpointSubmitting, setCheckpointSubmitting] = useState(false)

  const hasCompletedVideoRef = useRef(false)
  const wrapperRef = useRef(null)
  const playerContainerRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const lastProgressSaveRef = useRef(0)
  const isUpdatingProgressRef = useRef(false)
  const isSeekingRef = useRef(false)
  const existingProgressRef = useRef(null) // Store existing progress from database
  const maxWatchedTimeRef = useRef(0) // Track maximum watched time in current session

  // Only get the functions we need, not the state values that cause re-renders
  const markVideoComplete = useVideoStore((state) => state.markVideoComplete)
  const setPlaybackTime = useVideoStore((state) => state.setPlaybackTime)
  const setDuration = useVideoStore((state) => state.setDuration)

  const previousVideoRef = useRef(`${videoId}-${courseId}`)

  useEffect(() => {
    const currentVideoKey = `${videoId}-${courseId}`

    // Only reset if video actually changed
    if (previousVideoRef.current !== currentVideoKey) {
      previousVideoRef.current = currentVideoKey

      // Reset completion state when video changes
      hasCompletedVideoRef.current = false
      isUpdatingProgressRef.current = false
      lastProgressSaveRef.current = 0
      maxWatchedTimeRef.current = 0
      existingProgressRef.current = null
      // Reset player state to trigger new video load
      setYoutubeVideoId(null)
      setPlayerReady(false)
      setIsPlaying(false)
      setHasEnded(false)
      setCurrentTime(0)
      setVideoDuration(0)
      setLoading(true)
      setError(null)
      // Reset checkpoint questions
      activeCheckpointRef.current = null
      setActiveCheckpoint(null)
      setCheckpointWrong(false)
    }
  }, [videoId, courseId])

  // Load this video's checkpoint questions (server never sends correct answers)
  useEffect(() => {
    checkpointsRef.current = []

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/questions`)
        if (!res.ok) return
        const data = await res.json()
        checkpointsRef.current = (data.questions || []).map((q) => ({ ...q, answered: false }))
      } catch {
        // No checkpoints if the request fails - video still plays normally
      }
    }

    if (videoId) fetchQuestions()
  }, [videoId])

  useEffect(() => {
    const moveWatermark = () => {
      const newX = Math.random() * 80
      const newY = Math.random() * 80
      setWatermarkPosition({ x: newX, y: newY })
    }

    const interval = setInterval(moveWatermark, Math.random() * 5000 + 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch existing progress when video loads
  useEffect(() => {
    const fetchProgress = async () => {
      if (!videoId || !courseId) return

      try {
        const res = await fetch(`/api/progress/get?videoId=${videoId}&courseId=${courseId}`)
        const data = await res.json()

        if (res.ok && data.progress) {
          existingProgressRef.current = data.progress
          // If already completed, mark it
          if (data.progress.completed) {
            hasCompletedVideoRef.current = true
            markVideoComplete(courseId, videoId)
          }
        } else {
          existingProgressRef.current = null
        }
      } catch (err) {
        existingProgressRef.current = null
      }
    }

    fetchProgress()
  }, [videoId, courseId, markVideoComplete])

  // Verify access and get the YouTube video ID for this lesson
  useEffect(() => {
    const fetchVideoSource = async () => {
      try {
        const res = await fetch("/api/stream/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, courseId }),
        })

        const data = await res.json()

        if (!res.ok) {
          console.error("[v0] Video source request failed:", {
            status: res.status,
            message: data.message,
          })
          setError(data.message || res.statusText)
          throw new Error(data.message)
        }

        setYoutubeVideoId(data.youtubeVideoId)
        maxWatchedTimeRef.current = 0
      } catch (err) {
        if (!error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (videoId && courseId) {
      fetchVideoSource()
    } else {
      setError("Missing video or course ID")
      setLoading(false)
    }
  }, [videoId, courseId, error])

  // Define handleVideoCompletion before useEffect
  const handleVideoCompletion = useCallback(async (watchedTime, totalDuration) => {
    if (hasCompletedVideoRef.current || isUpdatingProgressRef.current) return

    hasCompletedVideoRef.current = true
    isUpdatingProgressRef.current = true
    markVideoComplete(courseId, videoId)

    try {
      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          courseId,
          completed: true,
          watchedSeconds: Math.floor(watchedTime),
          totalSeconds: Math.floor(totalDuration),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Update existing progress ref
        existingProgressRef.current = data.progress

        if (data.creditsAwarded > 0) {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('videoCompleted', {
              detail: { credits: data.creditsAwarded, total: data.totalCredits }
            }))
          }
        }
      }
    } catch (err) {
      console.error("[v0] Error marking video complete:", err)
      hasCompletedVideoRef.current = false // Allow retry on error
    } finally {
      isUpdatingProgressRef.current = false
    }
  }, [videoId, courseId, markVideoComplete])

  // Poll playback time while the video is playing (the IFrame API has no timeupdate event)
  const startProgressPolling = useCallback(() => {
    if (pollIntervalRef.current) return

    pollIntervalRef.current = setInterval(() => {
      const player = ytPlayerRef.current
      if (!player || typeof player.getCurrentTime !== "function") return

      const time = player.getCurrentTime()
      const total = player.getDuration()

      if (!(time >= 0) || !(total > 0)) return

      // Fire a checkpoint question when playback crosses its trigger time.
      // Skipped for videos the student already completed earlier.
      if (!activeCheckpointRef.current && !hasCompletedVideoRef.current) {
        const list = checkpointsRef.current
        if (list.length > 0) {
          const n = list.length
          const due = list.find((q, idx) => {
            if (q.answered) return false
            let trigger =
              q.triggerTime !== null && q.triggerTime !== undefined
                ? q.triggerTime
                : Math.floor((total * (idx + 1)) / (n + 1)) // auto: spread evenly
            // A time past the end of the video would never fire - pull it
            // back so the question shows near the end instead
            trigger = Math.min(trigger, Math.max(1, Math.floor(total) - 3))
            return time >= trigger
          })

          if (due) {
            activeCheckpointRef.current = due
            setActiveCheckpoint(due)
            setCheckpointWrong(false)
            player.pauseVideo()
            return
          }
        }
      }

      // Keep the custom seek bar in sync (unless the user is dragging it)
      if (!isSeekingRef.current) {
        setCurrentTime(time)
      }
      setVideoDuration(total)

      if (time > maxWatchedTimeRef.current) {
        maxWatchedTimeRef.current = time
      }

      // Throttle store updates to prevent excessive re-renders
      if (Math.floor(time) % 5 === 0) {
        setPlaybackTime(time)
      }

      const totalWatchedTime = maxWatchedTimeRef.current
      const timeFloor = Math.floor(time)

      // Periodically save progress (every 30 seconds) to prevent loss
      if (
        !hasCompletedVideoRef.current &&
        timeFloor > 0 &&
        timeFloor % 30 === 0 &&
        timeFloor !== lastProgressSaveRef.current
      ) {
        lastProgressSaveRef.current = timeFloor
        fetch("/api/progress/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId,
            courseId,
            completed: false, // Not completed yet, just saving progress
            watchedSeconds: Math.floor(totalWatchedTime),
            totalSeconds: Math.floor(total),
          }),
        }).catch(err => console.error("[v0] Error saving progress:", err))
      }

      // Check for completion based on cumulative watch time (90% threshold)
      if (!hasCompletedVideoRef.current) {
        const progressPercentage = (totalWatchedTime / total) * 100
        if (progressPercentage >= 90) {
          handleVideoCompletion(totalWatchedTime, total)
        }
      }
    }, 1000)
  }, [videoId, courseId, setPlaybackTime, handleVideoCompletion])

  const stopProgressPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  // Show the masking bars, then fade them out once YouTube's overlays have faded
  const showMaskTemporarily = useCallback(() => {
    setMaskVisible(true)
    if (maskTimeoutRef.current) clearTimeout(maskTimeoutRef.current)
    maskTimeoutRef.current = setTimeout(() => setMaskVisible(false), 5000)
  }, [])

  useEffect(() => {
    return () => {
      if (maskTimeoutRef.current) clearTimeout(maskTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!youtubeVideoId || !playerContainerRef.current) return

    let cancelled = false

    // The YT.Player replaces this div with the iframe
    const mountNode = document.createElement("div")
    playerContainerRef.current.innerHTML = ""
    playerContainerRef.current.appendChild(mountNode)

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return

        ytPlayerRef.current = new YT.Player(mountNode, {
          videoId: youtubeVideoId,
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            controls: 0,         // Hide YouTube's own controls - we render our own
            disablekb: 1,        // Disable YouTube keyboard shortcuts
            fs: 0,               // Disable native fullscreen (we fullscreen the wrapper)
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,   // Hide video annotations
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              const total = event.target.getDuration()
              if (total > 0) {
                setVideoDuration(total)
                setDuration(total)
              }
              setPlayerReady(true)
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                setHasEnded(false)
                showMaskTemporarily()
                const total = event.target.getDuration()
                if (total > 0) {
                  setVideoDuration(total)
                  setDuration(total)
                }
                startProgressPolling()
              } else if (event.data === YT.PlayerState.PAUSED) {
                setIsPlaying(false)
                stopProgressPolling()
              } else if (event.data === YT.PlayerState.ENDED) {
                setIsPlaying(false)
                setHasEnded(true)
                stopProgressPolling()

                // Video watched to the very end counts as complete regardless of polling
                if (!hasCompletedVideoRef.current) {
                  const total = event.target.getDuration()
                  if (total > 0) {
                    handleVideoCompletion(Math.max(maxWatchedTimeRef.current, total), total)
                  }
                }
              }
            },
            onError: (event) => {
              console.error("[v0] YouTube player error code:", event.data)
              // 100/101/150 = video not found or embedding disabled
              if (event.data === 101 || event.data === 150) {
                setError("This video cannot be embedded. Ask the instructor to allow embedding in YouTube Studio.")
              } else if (event.data === 100) {
                setError("Video not found. It may have been deleted or set to Private on YouTube.")
              }
            },
          },
        })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[v0] Failed to load YouTube API:", err)
          setError("Failed to load video player")
        }
      })

    return () => {
      cancelled = true
      stopProgressPolling()
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      ytPlayerRef.current = null
    }
  }, [youtubeVideoId, setDuration, startProgressPolling, stopProgressPolling, handleVideoCompletion, showMaskTemporarily])

  // Answer a checkpoint question - popup only closes on a correct answer
  const handleCheckpointAnswer = useCallback(async (optionIndex) => {
    const q = activeCheckpointRef.current
    if (!q || checkpointSubmitting) return

    setCheckpointSubmitting(true)
    setCheckpointWrong(false)

    try {
      const res = await fetch(`/api/videos/${videoId}/questions/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, answer: optionIndex }),
      })
      const data = await res.json()

      if (res.ok && data.correct) {
        q.answered = true
        activeCheckpointRef.current = null
        setActiveCheckpoint(null)
        ytPlayerRef.current?.playVideo?.()
      } else {
        setCheckpointWrong(true)
      }
    } catch {
      setCheckpointWrong(true)
    } finally {
      setCheckpointSubmitting(false)
    }
  }, [videoId, checkpointSubmitting])

  const togglePlay = useCallback(() => {
    if (activeCheckpointRef.current) return // Must answer the question first
    const player = ytPlayerRef.current
    if (!player || !playerReady) return
    if (hasEnded) {
      player.seekTo(0, true)
      player.playVideo()
      setHasEnded(false)
      return
    }
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [isPlaying, hasEnded, playerReady])

  const toggleMute = useCallback(() => {
    const player = ytPlayerRef.current
    if (!player || !playerReady) return
    if (isMuted) {
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }, [isMuted, playerReady])

  const handleSeek = useCallback((e) => {
    if (activeCheckpointRef.current) return // Must answer the question first
    const value = Number(e.target.value)
    setCurrentTime(value)
    const player = ytPlayerRef.current
    if (player && playerReady) {
      player.seekTo(value, true)
      showMaskTemporarily()
    }
  }, [playerReady, showMaskTemporarily])

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else if (el.requestFullscreen) {
        el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    } catch (e) {
      // Fullscreen not supported - ignore
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full bg-black rounded-lg flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-black rounded-lg flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        <div className="text-white text-center p-4">
          <p className="text-red-500 mb-2 font-bold">Error loading video</p>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-400">Check browser console for details</p>
        </div>
      </div>
    )
  }

  if (!youtubeVideoId) {
    return (
      <div className="w-full bg-black rounded-lg flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Preparing video...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full rounded-lg overflow-hidden shadow-lg relative bg-black flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <div
          ref={playerContainerRef}
          className="w-full h-full absolute inset-0 bg-black [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
        />

        {/* Click shield: blocks ALL direct interaction with the YouTube iframe
            (no title link, no "Watch on YouTube", no right-click menu).
            Clicking it toggles play/pause through the API instead. */}
        <div
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={togglePlay}
        />

        {/* Temporary letterbox masks: cover YouTube's title (top) and
            logo/link icons (bottom) while YouTube displays them, then fade out */}
        <div
          className={`absolute top-0 inset-x-0 h-[18%] z-20 bg-black pointer-events-none transition-opacity duration-700 ${maskVisible ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute bottom-0 inset-x-0 h-[16%] z-20 bg-black pointer-events-none transition-opacity duration-700 ${maskVisible ? "opacity-100" : "opacity-0"}`}
        />

        {/* Checkpoint question popup: pauses the lesson and stays until the
            student answers correctly */}
        {activeCheckpoint && (
          <div className="absolute inset-0 z-[35] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-md w-full">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-3">
                📝 Quick check — answer correctly to continue
              </p>
              <p className="text-white font-semibold text-sm sm:text-base mb-4">
                {activeCheckpoint.text}
              </p>
              <div className="space-y-2">
                {activeCheckpoint.options.map((option, i) => (
                  <button
                    key={i}
                    disabled={checkpointSubmitting}
                    onClick={() => handleCheckpointAnswer(i)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 text-white text-sm sm:text-base transition disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
              {checkpointWrong && (
                <p className="text-red-400 text-sm mt-3 font-semibold">
                  ❌ Not correct — try again!
                </p>
              )}
              {checkpointSubmitting && (
                <p className="text-white/60 text-xs mt-3">Checking...</p>
              )}
            </div>
          </div>
        )}

        {/* Opaque cover while paused / not started / ended:
            fully hides YouTube's pause screen, related videos and links */}
        {(!isPlaying || hasEnded) && !activeCheckpoint && (
          <div
            className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full flex items-center justify-center mx-auto mb-3 transition">
                {hasEnded ? (
                  <RotateCcw className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                ) : (
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" />
                )}
              </div>
              {videoTitle && (
                <p className="text-white/90 text-sm sm:text-base font-medium px-4 line-clamp-2">{videoTitle}</p>
              )}
              <p className="text-white/50 text-xs mt-1">
                {hasEnded ? "Watch again" : playerReady ? "Click to play" : "Loading player..."}
              </p>
            </div>
          </div>
        )}

        {userName && userId && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <div
              className="absolute transition-all duration-[8000ms] ease-linear"
              style={{
                left: `${watermarkPosition.x}%`,
                top: `${watermarkPosition.y}%`,
              }}
            >
              <div className="bg-black/30 backdrop-blur-sm text-white/70 px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap select-none">
                <div>{userName}</div>
                <div className="text-[10px] text-white/50">ID: {userId}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom controls bar */}
      <div className="relative z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900 select-none">
        <button
          onClick={togglePlay}
          className="text-white hover:text-white/80 transition flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <span className="text-white/80 text-xs font-mono flex-shrink-0">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={videoDuration || 0}
          step={1}
          value={Math.min(currentTime, videoDuration || 0)}
          onChange={handleSeek}
          onPointerDown={() => { isSeekingRef.current = true }}
          onPointerUp={() => { isSeekingRef.current = false }}
          className="flex-1 h-1.5 accent-red-600 cursor-pointer"
          aria-label="Seek"
        />

        <span className="text-white/80 text-xs font-mono flex-shrink-0">
          {formatTime(videoDuration)}
        </span>

        <button
          onClick={toggleMute}
          className="text-white hover:text-white/80 transition flex-shrink-0"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="text-white hover:text-white/80 transition flex-shrink-0"
          aria-label="Fullscreen"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
