// Helpers for YouTube-hosted course videos.
// Videos are uploaded to YouTube as UNLISTED (not private - private videos
// cannot be embedded). The video ID is stored in the database and only
// exposed to enrolled students through /api/stream/generate-token.

/**
 * Extract the 11-character YouTube video ID from a URL or raw ID.
 * Supports:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 *   VIDEO_ID (raw)
 * Returns null if no valid ID is found.
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== "string") return null

  const trimmed = input.trim()

  // Raw 11-character video ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  let url
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\.|^m\./, "")

  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1]
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    // /watch?v=VIDEO_ID
    const v = url.searchParams.get("v")
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v

    // /embed/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/)
    if (match) return match[1]
  }

  return null
}

/**
 * Thumbnail URL for a YouTube video (no API key needed).
 */
export function getYouTubeThumbnailUrl(videoId, quality = "hqdefault") {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}
