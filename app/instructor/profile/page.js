"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Mail, FileText, Camera, Save, AlertCircle, CheckCircle } from "lucide-react"

export default function ProfileSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setBio(session.user.bio || "")
    }
  }, [session])

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 4000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement profile update API
      console.log("Saving profile:", { name, bio })
      showNotification("Profile updated successfully!", "success")
    } catch (error) {
      console.error("Error saving profile:", error)
      showNotification("Failed to update profile", "error")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Profile Settings</h1>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4" />
                Update your profile information
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            <p className="text-sm text-slate-600 mt-1">Manage your public profile details</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-4">Profile Picture</label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <button className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-medium">
                    Upload Photo
                  </button>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <User className="w-4 h-4 text-blue-600" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all resize-none"
                rows="5"
                placeholder="Tell students about yourself, your expertise, and teaching experience..."
              />
              <p className="mt-2 text-xs text-slate-500">
                Write a brief introduction that will appear on your instructor profile
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <Mail className="w-4 h-4 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-slate-500">Email cannot be changed for security reasons</p>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 font-medium"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition-all font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
