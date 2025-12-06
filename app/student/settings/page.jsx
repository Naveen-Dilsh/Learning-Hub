"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import ImageUpload from "@/components/image-upload"

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    studentNumber: "",
    credits: 0,
    // Delivery address fields
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Sri Lanka",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.name || "",
          email: data.email || "",
          image: data.image || "",
          studentNumber: data.studentNumber || "",
          credits: data.credits || 0,
          phone: data.phone || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          district: data.district || "",
          postalCode: data.postalCode || "",
          country: data.country || "Sri Lanka",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        await update({
          name: updatedUser.name,
          image: updatedUser.image,
        })
        setMessage({ type: "success", text: "Profile updated successfully!" })
        setTimeout(() => setMessage({ type: "", text: "" }), 3000)
      } else {
        setMessage({ type: "error", text: "Error updating profile" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error updating profile" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      <div className="max-w-3xl space-y-8">
        {/* Profile Information Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-600"
                  : "bg-red-500/10 border border-red-500/20 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
              <ImageUpload onUploadComplete={handleImageUpload} currentImage={formData.image} aspectRatio="square" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.studentNumber && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Student Number</label>
                  <input
                    type="text"
                    value={formData.studentNumber}
                    disabled
                    className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Credits</label>
                <input
                  type="text"
                  value={formData.credits}
                  disabled
                  className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>

            {/* Delivery Address Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Address</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This address will be used for course material deliveries. You can update it anytime.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House number, Street name"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">District *</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Postal Code"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
