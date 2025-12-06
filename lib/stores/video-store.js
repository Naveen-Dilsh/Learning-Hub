"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useVideoStore = create(
  persist(
    (set, get) => ({
      // Video playback state
      currentVideoId: null,
      currentCourseId: null,
      playbackTime: 0,
      isPlaying: false,
      duration: 0,

      // Completion tracking
      completedVideos: {}, // { courseId: [videoIds] }
      lessonProgress: {}, // { courseId: { videoId: { watched: number, total: number } } }

      // Actions
      setCurrentVideo: (videoId, courseId) =>
        set({
          currentVideoId: videoId,
          currentCourseId: courseId,
          playbackTime: 0,
          isPlaying: false,
        }),

      setPlaybackTime: (time) => set({ playbackTime: time }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setDuration: (duration) => set({ duration }),

      markVideoComplete: (courseId, videoId) => {
        const { completedVideos } = get()
        const courseVideos = completedVideos[courseId] || []
        if (!courseVideos.includes(videoId)) {
          set({
            completedVideos: {
              ...completedVideos,
              [courseId]: [...courseVideos, videoId],
            },
          })
        }
      },

      updateLessonProgress: (courseId, videoId, watched, total) => {
        const { lessonProgress } = get()
        set({
          lessonProgress: {
            ...lessonProgress,
            [courseId]: {
              ...lessonProgress[courseId],
              [videoId]: { watched, total },
            },
          },
        })
      },

      getVideoProgress: (courseId, videoId) => {
        const { lessonProgress } = get()
        return lessonProgress[courseId]?.[videoId] || { watched: 0, total: 0 }
      },

      isVideoCompleted: (courseId, videoId) => {
        const { completedVideos } = get()
        return completedVideos[courseId]?.includes(videoId) || false
      },

      resetCourseProgress: (courseId) => {
        const { completedVideos, lessonProgress } = get()
        const newCompleted = { ...completedVideos }
        const newProgress = { ...lessonProgress }
        delete newCompleted[courseId]
        delete newProgress[courseId]
        set({
          completedVideos: newCompleted,
          lessonProgress: newProgress,
          currentVideoId: null,
          currentCourseId: null,
        })
      },
    }),
    {
      name: "video-store",
    },
  ),
)
