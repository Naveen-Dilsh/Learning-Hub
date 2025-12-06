"use client"

import { useVideoStore } from "@/lib/stores"

export const useVideoPlayer = (videoId, courseId) => {
  const {
    currentVideoId,
    currentCourseId,
    playbackTime,
    isPlaying,
    duration,
    setCurrentVideo,
    setPlaybackTime,
    setIsPlaying,
    setDuration,
    markVideoComplete,
    isVideoCompleted,
    updateLessonProgress,
    getVideoProgress,
  } = useVideoStore()

  const isCurrentVideo = currentVideoId === videoId && currentCourseId === courseId
  const progress = getVideoProgress(courseId, videoId)
  const isCompleted = isVideoCompleted(courseId, videoId)

  return {
    isCurrentVideo,
    playbackTime: isCurrentVideo ? playbackTime : progress.watched,
    isPlaying: isCurrentVideo ? isPlaying : false,
    duration,
    isCompleted,
    setCurrentVideo,
    setPlaybackTime,
    setIsPlaying,
    setDuration,
    markVideoComplete,
    updateLessonProgress,
  }
}
