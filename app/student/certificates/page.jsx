"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Award } from "lucide-react"

export default function Certificates() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCertificates()
    }
  }, [session])

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/student/certificates?studentId=${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificates</h1>
      <p className="text-gray-600 mb-8">Your earned certificates from completed courses</p>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">No certificates yet</p>
          <p className="text-gray-600">Complete courses to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <Award className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{cert.course?.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Completed on {new Date(cert.issuedAt).toLocaleDateString()}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
