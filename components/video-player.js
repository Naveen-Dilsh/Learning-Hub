"use client"

import { useEffect, useState, useRef } from "react"
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

  const { setPlaybackTime, setDuration, markVideoComplete } = useVideoStore()

  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  
  useEffect(() => {
    hasCompletedVideoRef.current = false
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
  }, [videoId, courseId])

  useEffect(() => {
    if (!embedUrl || !playerContainerRef.current) return

    console.log("[v0] Initializing Stream Player with token:", embedUrl.substring(0, 20) + "...")

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

    // Load Stream Player SDK to communicate with iframe
    const script = document.createElement('script')
    script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js'
    script.async = true
    
    script.onload = () => {
      console.log("[v0] Stream Player SDK loaded")
      
      // Initialize Stream Player SDK with iframe
      if (window.Stream) {
        streamPlayerRef.current = window.Stream(iframe)
        
        // Listen to player events
        streamPlayerRef.current.addEventListener('loadedmetadata', () => {
          const videoDuration = streamPlayerRef.current.duration
          console.log("[v0] Video duration:", videoDuration)
          setDurationState(videoDuration)
          setDuration(videoDuration)
        })

        streamPlayerRef.current.addEventListener('timeupdate', () => {
          const currentTime = streamPlayerRef.current.currentTime
          const videoDuration = streamPlayerRef.current.duration
          
          setPlaybackTimeState(currentTime)
          setPlaybackTime(currentTime)
          
          // Log progress every 10 seconds
          if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
            console.log("[v0] Progress:", {
              current: Math.floor(currentTime),
              total: Math.floor(videoDuration),
              percentage: ((currentTime / videoDuration) * 100).toFixed(1) + "%"
            })
          }

          if (!hasCompletedVideoRef.current && videoDuration > 0) {
            const progressPercentage = (currentTime / videoDuration) * 100
            
            if (progressPercentage >= 90) {
              console.log("[v0] 🎉 Reached 90% completion!")
              handleVideoCompletion(currentTime, videoDuration)
            }
          }
        })

        streamPlayerRef.current.addEventListener('error', (e) => {
          console.error("[v0] Player error:", e)
        })
      }
    }
    
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
      if (streamPlayerRef.current) {
        streamPlayerRef.current = null
      }
    }
  }, [embedUrl, accountId])

  const handleVideoCompletion = async (currentTime, videoDuration) => {
    if (hasCompletedVideoRef.current) return

    hasCompletedVideoRef.current = true
    markVideoComplete(courseId, videoId)

    console.log("[v0] 🎉 Video completed! Awarding points...")

    try {
      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          courseId,
          completed: true,
          watchedSeconds: Math.floor(currentTime || playbackTime),
          totalSeconds: Math.floor(videoDuration || duration),
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.creditsAwarded > 0) {
        console.log("[v0] 🎉 Earned", data.creditsAwarded, "credits! Total:", data.totalCredits)
        alert(`Congratulations! You earned ${data.creditsAwarded} credits! 🎉`)
      }
    } catch (err) {
      console.error("[v0] Error marking video complete:", err)
    }
  }

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
