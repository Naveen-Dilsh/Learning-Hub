"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import LoadingBubbles from "@/components/loadingBubbles"
import Image from "next/image"
import { 
  Edit2, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Award, 
  Hash,
  Calendar,
  CheckCircle2,
  Settings as SettingsIcon
} from "lucide-react"

// Sri Lankan districts for dropdown
const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Moneragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
]

export default function Settings() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    studentNumber: "",
    credits: 0,
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Sri Lanka",
    createdAt: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await fetch("/api/user/profile", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch profile")
      }

      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000, // 60 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Loading Profile",
        description: error.message || "Failed to load profile. Please try again.",
      })
    },
  })

  // Update form data when profile data changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        image: profileData.image || "",
        studentNumber: profileData.studentNumber || "",
        credits: profileData.credits || 0,
        phone: profileData.phone || "",
        addressLine1: profileData.addressLine1 || "",
        addressLine2: profileData.addressLine2 || "",
        city: profileData.city || "",
        district: profileData.district || "",
        postalCode: profileData.postalCode || "",
        country: profileData.country || "Sri Lanka",
        createdAt: profileData.createdAt || "",
      })
    }
  }, [profileData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleImageUpload = useCallback((imageUrl) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }))
  }, [])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleCancel = useCallback(() => {
    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        image: profileData.image || "",
        studentNumber: profileData.studentNumber || "",
        credits: profileData.credits || 0,
        phone: profileData.phone || "",
        addressLine1: profileData.addressLine1 || "",
        addressLine2: profileData.addressLine2 || "",
        city: profileData.city || "",
        district: profileData.district || "",
        postalCode: profileData.postalCode || "",
        country: profileData.country || "Sri Lanka",
        createdAt: profileData.createdAt || "",
      })
    }
    setIsEditing(false)
  }, [profileData])

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile")
      }

      return await res.json()
    },
    onSuccess: async (updatedUser) => {
      await update({
        name: updatedUser.name,
        image: updatedUser.image,
      })

      // Update formData immediately with the updated data
      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name || prev.name,
        image: updatedUser.image || prev.image,
        phone: updatedUser.phone || prev.phone,
        addressLine1: updatedUser.addressLine1 || prev.addressLine1,
        addressLine2: updatedUser.addressLine2 || prev.addressLine2,
        city: updatedUser.city || prev.city,
        district: updatedUser.district || prev.district,
        postalCode: updatedUser.postalCode || prev.postalCode,
        country: updatedUser.country || prev.country,
      }))

      // Invalidate and refetch profile query
      await queryClient.invalidateQueries({ queryKey: ["userProfile", session?.user?.id] })
      await queryClient.refetchQueries({ queryKey: ["userProfile", session?.user?.id] })
      
      setIsEditing(false)
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Updating Profile",
        description: error.message || "Failed to update profile. Please try again.",
      })
    },
  })

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      updateProfileMutation.mutate({
        name: formData.name,
        image: formData.image,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
        country: formData.country,
      })
    },
    [formData, updateProfileMutation]
  )

  // Memoized computed values
  const hasCompleteAddress = useMemo(
    () => Boolean(
      formData.phone?.trim() &&
      formData.addressLine1?.trim() && 
      formData.city?.trim() && 
      formData.district?.trim()
    ),
    [formData.phone, formData.addressLine1, formData.city, formData.district]
  )

  const memberSince = useMemo(() => {
    if (!formData.createdAt) return "N/A"
    return new Date(formData.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }, [formData.createdAt])

  // Show loading if query is loading OR if session is not ready yet
  if (isLoading || !session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your student profile and delivery address
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 sticky top-24">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 mb-3 sm:mb-4">
                  {formData.image ? (
                    <Image
                      src={formData.image}
                      alt={formData.name || "Profile"}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl sm:text-3xl font-bold">
                      {formData.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-1">
                  {formData.name || "User"}
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-4">{formData.email}</p>
                
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="btn-primary inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-border">
                {formData.studentNumber && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Student Number</p>
                      <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {formData.studentNumber}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {formData.credits.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-5/10 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-chart-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {memberSince}
                    </p>
                  </div>
                </div>

                {hasCompleteAddress && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Delivery Address</p>
                      <p className="text-sm font-semibold text-success">Complete</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {!isEditing ? (
              /* View Mode */
              <div className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm sm:text-base text-foreground break-all">{formData.email}</p>
                      </div>
                    </div>
                    {formData.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Phone</p>
                          <p className="text-sm sm:text-base text-foreground">{formData.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Address
                  </h3>
                  {hasCompleteAddress ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-foreground font-semibold">{formData.name}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm sm:text-base text-foreground">{formData.addressLine1}</p>
                          {formData.addressLine2 && (
                            <p className="text-sm sm:text-base text-foreground">{formData.addressLine2}</p>
                          )}
                          <p className="text-sm sm:text-base text-foreground">
                            {formData.city}, {formData.district}
                          </p>
                          {formData.postalCode && (
                            <p className="text-sm sm:text-base text-foreground">
                              Postal Code: {formData.postalCode}
                            </p>
                          )}
                          <p className="text-sm sm:text-base text-foreground">{formData.country}</p>
                        </div>
                      </div>
                      {formData.phone && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border">
                          <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">Phone</p>
                            <p className="text-sm sm:text-base text-foreground">{formData.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        No delivery address added yet
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Add your address to receive course materials
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Edit Profile</h3>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
                      <ImageUpload 
                        onUploadComplete={handleImageUpload} 
                        currentImage={formData.image} 
                        aspectRatio="square" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="07XXXXXXXX (e.g., 0771234567)"
                        className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for delivery notifications and course material shipments
                      </p>
                    </div>

                    {/* Delivery Address Section */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">Delivery Address</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                        This address will be used for course material deliveries.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Address Line 1 <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            placeholder="House number, Street name (e.g., 123 Main Street)"
                            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Address Line 2</label>
                          <input
                            type="text"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleChange}
                            placeholder="Apartment, suite, landmark (optional)"
                            className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              City <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="City (e.g., Colombo)"
                              className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              District <span className="text-destructive">*</span>
                            </label>
                            <select
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            >
                              <option value="">Select District</option>
                              {SRI_LANKAN_DISTRICTS.map((district) => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Postal Code</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleChange}
                              placeholder="Postal Code (e.g., 00100)"
                              className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground/50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              disabled
                              className="w-full px-4 py-2.5 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
