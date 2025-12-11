"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useVideoStore } from "@/lib/stores"

export default function VideoPlayer({ videoId, courseId, videoTitle, userName, userId }) {
  const [embedUrl, setEmbedUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playbackTime, setPlaybackTimeState] = useState(0)
  const [duration, setDurationState] = useState(0)
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 10, y: 10 })
  const hasCompletedVideoRef = useRef(false)
  const playerContainerRef = useRef(null)
  const streamPlayerRef = useRef(null)
  const progressUpdateTimeoutRef = useRef(null)
  const lastProgressUpdateRef = useRef(0)
  const isUpdatingProgressRef = useRef(false)
  const existingProgressRef = useRef(null) // Store existing progress from database
  const maxWatchedTimeRef = useRef(0) // Track maximum watched time in current session
  const sessionStartTimeRef = useRef(0) // Track when current session started

  // Only get the functions we need, not the state values that cause re-renders
  const markVideoComplete = useVideoStore((state) => state.markVideoComplete)
  const setPlaybackTime = useVideoStore((state) => state.setPlaybackTime)
  const setDuration = useVideoStore((state) => state.setDuration)

  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  
  const previousVideoRef = useRef(`${videoId}-${courseId}`)
  
  useEffect(() => {
    const currentVideoKey = `${videoId}-${courseId}`
    
    // Only reset if video actually changed
    if (previousVideoRef.current !== currentVideoKey) {
      previousVideoRef.current = currentVideoKey
      
      // Reset completion state when video changes
      hasCompletedVideoRef.current = false
      isUpdatingProgressRef.current = false
      lastProgressUpdateRef.current = 0
      maxWatchedTimeRef.current = 0
      sessionStartTimeRef.current = 0
      existingProgressRef.current = null
      // Reset local state
      setPlaybackTimeState(0)
      setDurationState(0)
      // Clear any pending progress updates
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current)
        progressUpdateTimeoutRef.current = null
      }
      // Reset embedUrl to trigger new video load
      setEmbedUrl(null)
      setLoading(true)
      setError(null)
    }
  }, [videoId, courseId])
  
  if (!accountId || accountId === "undefined") {
    return (
      <div className="w-full bg-red-50 rounded-lg flex items-center justify-center p-6" style={{ aspectRatio: "16/9" }}>
        <div className="text-center max-w-md">
          <p className="text-red-600 font-bold mb-2">Cloudflare Stream Not Configured</p>
          <p className="text-sm text-red-500 mb-4">
            Environment variable <code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID</code> is missing.
          </p>
          <ol className="text-xs text-gray-600 text-left space-y-2 mb-4">
            <li>1. Get your Account ID from Cloudflare Dashboard → Stream</li>
            <li>2. Add to v0 Vars: <code className="bg-gray-100 px-1">NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=YOUR_ID</code></li>
            <li>3. Refresh this page</li>
          </ol>
          <p className="text-xs text-gray-500">Or check browser console for more details</p>
        </div>
      </div>
    )
  }

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
          console.log("[v0] Existing progress loaded:", {
            completed: data.progress.completed,
            videoId,
          })
        } else {
          existingProgressRef.current = null
        }
      } catch (err) {
        console.error("[v0] Error fetching progress:", err)
        existingProgressRef.current = null
      }
    }

    fetchProgress()
  }, [videoId, courseId, markVideoComplete])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log("[v0] Fetching video token for:", { videoId, courseId })
        const res = await fetch("/api/stream/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, courseId }),
        })

        const data = await res.json()

        if (!res.ok) {
          console.error("[v0] Token generation failed:", { 
            status: res.status, 
            message: data.message,
            videoId,
            courseId 
          })

          if (data.message?.includes('not ready')) {
            setError(
              'Video not uploaded to Cloudflare Stream yet. Please contact the instructor to re-upload this video.'
            )
          } else {
            setError(data.message || res.statusText)
          }
          throw new Error(data.message)
        }

        console.log("[v0] Token generated successfully")
        setEmbedUrl(data.token || data.embedUrl)
        // Reset session tracking when new video loads
        sessionStartTimeRef.current = 0
        maxWatchedTimeRef.current = 0
      } catch (err) {
        console.error("[v0] Error in fetchToken:", err.message)
        if (!error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (videoId && courseId) {
      fetchToken()
    } else {
      console.error("[v0] Missing videoId or courseId:", { videoId, courseId })
      setError("Missing video or course ID")
      setLoading(false)
    }
  }, [videoId, courseId, error])

  // Define handleVideoCompletion before useEffect
  const handleVideoCompletion = useCallback(async (watchedTime, videoDuration) => {
    if (hasCompletedVideoRef.current || isUpdatingProgressRef.current) return

    hasCompletedVideoRef.current = true
    isUpdatingProgressRef.current = true
    markVideoComplete(courseId, videoId)

    console.log("[v0] 🎉 Video completed! Total watched:", watchedTime.toFixed(1), "seconds out of", videoDuration.toFixed(1))

    try {
      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          courseId,
          completed: true,
          watchedSeconds: Math.floor(watchedTime),
          totalSeconds: Math.floor(videoDuration),
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        // Update existing progress ref
        existingProgressRef.current = data.progress
        
        if (data.creditsAwarded > 0) {
          console.log("[v0] 🎉 Earned", data.creditsAwarded, "credits! Total:", data.totalCredits)
          // Use a subtle notification instead of alert
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

  useEffect(() => {
    if (!embedUrl || !playerContainerRef.current) return

    // Prevent re-initialization if iframe already exists for this video
    const existingIframe = playerContainerRef.current.querySelector('iframe')
    if (existingIframe && existingIframe.src.includes(embedUrl)) {
      console.log("[v0] Iframe already exists for this video, skipping re-initialization")
      return
    }

    console.log("[v0] Initializing Stream Player with token:", embedUrl.substring(0, 20) + "...")

    // Clean up previous player if exists
    if (streamPlayerRef.current) {
      try {
        streamPlayerRef.current.removeEventListener('loadedmetadata', () => {})
        streamPlayerRef.current.removeEventListener('timeupdate', () => {})
        streamPlayerRef.current.removeEventListener('error', () => {})
      } catch (e) {
        // Ignore cleanup errors
      }
      streamPlayerRef.current = null
    }

    // Create iframe for Stream Player
    const iframe = document.createElement('iframe')
    iframe.src = `https://customer-${accountId}.cloudflarestream.com/${embedUrl}/iframe`
    iframe.style.border = 'none'
    iframe.style.position = 'absolute'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
    iframe.allowFullscreen = true
    
    // Clear container and add iframe
    playerContainerRef.current.innerHTML = ''
    playerContainerRef.current.appendChild(iframe)

    // Check if SDK is already loaded
    const isSDKLoaded = typeof window !== 'undefined' && window.Stream
    
    const initializePlayer = () => {
      if (!window.Stream || !iframe) return
      
      console.log("[v0] Stream Player SDK loaded")
      
      // Initialize Stream Player SDK with iframe
      streamPlayerRef.current = window.Stream(iframe)
      
      // Listen to player events
      streamPlayerRef.current.addEventListener('loadedmetadata', () => {
        if (!streamPlayerRef.current) return
        const videoDuration = streamPlayerRef.current.duration
        console.log("[v0] Video duration:", videoDuration)
        setDurationState(videoDuration)
        setDuration(videoDuration)
      })

      streamPlayerRef.current.addEventListener('timeupdate', () => {
        if (!streamPlayerRef.current) return
        const currentTime = streamPlayerRef.current.currentTime
        const videoDuration = streamPlayerRef.current.duration
        
        // Only update state if values are valid
        if (currentTime >= 0 && videoDuration > 0) {
          setPlaybackTimeState(currentTime)
          // Track maximum watched time in this session
          if (currentTime > maxWatchedTimeRef.current) {
            maxWatchedTimeRef.current = currentTime
          }
          
          // Throttle store updates to prevent excessive re-renders
          if (Math.floor(currentTime) % 5 === 0 || currentTime === 0) {
            setPlaybackTime(currentTime)
          }
          
          // Throttle progress logging (every 10 seconds)
          const currentTimeFloor = Math.floor(currentTime)
          if (currentTimeFloor !== lastProgressUpdateRef.current && currentTimeFloor % 10 === 0 && currentTime > 0) {
            lastProgressUpdateRef.current = currentTimeFloor
            console.log("[v0] Progress:", {
              current: currentTimeFloor,
              total: Math.floor(videoDuration),
              percentage: ((currentTime / videoDuration) * 100).toFixed(1) + "%"
            })
          }

          // Check for completion based on cumulative watch time (90% threshold)
          if (!hasCompletedVideoRef.current && videoDuration > 0) {
            // Use the maximum watched time reached in this session
            // This handles the case where user watches part, leaves, and comes back
            const totalWatchedTime = maxWatchedTimeRef.current
            const progressPercentage = (totalWatchedTime / videoDuration) * 100
            
            // Also periodically save progress (every 30 seconds) to prevent loss
            const currentTimeFloor = Math.floor(currentTime)
            if (currentTimeFloor > 0 && currentTimeFloor % 30 === 0 && currentTimeFloor !== lastProgressUpdateRef.current) {
              // Save progress in background (non-blocking)
              fetch("/api/progress/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  videoId,
                  courseId,
                  completed: false, // Not completed yet, just saving progress
                  watchedSeconds: Math.floor(totalWatchedTime),
                  totalSeconds: Math.floor(videoDuration),
                }),
              }).catch(err => console.error("[v0] Error saving progress:", err))
            }
            
            if (progressPercentage >= 90) {
              console.log("[v0] 🎉 Reached 90% completion! (Watched:", totalWatchedTime.toFixed(1), "seconds out of", videoDuration.toFixed(1), ")")
              handleVideoCompletion(totalWatchedTime, videoDuration)
            }
          }
        }
      })

      streamPlayerRef.current.addEventListener('error', (e) => {
        console.error("[v0] Player error:", e)
      })
    }

    if (isSDKLoaded) {
      // SDK already loaded, initialize immediately
      initializePlayer()
    } else {
      // Load Stream Player SDK to communicate with iframe
      const script = document.createElement('script')
      script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js'
      script.async = true
      
      script.onload = initializePlayer
      
      document.body.appendChild(script)

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script)
        }
      }
    }

    return () => {
      // Cleanup on unmount or video change
      if (streamPlayerRef.current) {
        try {
          streamPlayerRef.current.removeEventListener('loadedmetadata', () => {})
          streamPlayerRef.current.removeEventListener('timeupdate', () => {})
          streamPlayerRef.current.removeEventListener('error', () => {})
        } catch (e) {
          // Ignore cleanup errors
        }
        streamPlayerRef.current = null
      }
      // Clear any pending timeouts
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current)
        progressUpdateTimeoutRef.current = null
      }
    }
  }, [embedUrl, accountId, handleVideoCompletion])

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

  if (!embedUrl) {
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
    <div className="w-full rounded-lg overflow-hidden shadow-lg relative">
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <div 
          ref={playerContainerRef}
          className="w-full h-full absolute inset-0 bg-black"
        />
        
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
    </div>
  )
}
