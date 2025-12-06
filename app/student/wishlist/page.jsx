"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { useCart } from "@/lib/hooks"

export default function Wishlist() {
  const { data: session } = useSession()
  const { addToCart, isInCart } = useCart()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchWishlist()
    }
  }, [session])

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`/api/student/wishlist?studentId=${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setWishlist(data.wishlist || [])
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = (course) => {
    addToCart({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail,
    })
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist</h1>
      <p className="text-gray-600 mb-8">Courses you saved for later</p>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Your wishlist is empty</p>
          <p className="text-gray-600 mb-4">Add courses to your wishlist to keep track of them</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="relative">
                <img
                  src={item.course?.thumbnail || "/placeholder.svg"}
                  alt={item.course?.title}
                  className="w-full h-40 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition">
                  <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.course?.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.course?.description?.slice(0, 60)}...</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Rs. {item.course?.price}</span>
                  <Link
                    href={`/courses/${item.course?.id}/purchase`}
                    onClick={() => handleEnroll(item.course)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-medium"
                  >
                    Enroll
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
