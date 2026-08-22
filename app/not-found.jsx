import Link from "next/link"
import { Compass } from "lucide-react"

export const metadata = {
  title: "Page Not Found | ePencil Academy",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-muted-foreground" />
        </div>

        <p className="text-sm font-semibold text-primary mb-2">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/student"
            className="btn-primary inline-block px-6 py-3 rounded-lg font-semibold text-sm sm:text-base active:scale-[0.98]"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/student/browse-course"
            className="btn-secondary inline-block px-6 py-3 rounded-lg font-semibold text-sm sm:text-base active:scale-[0.98]"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  )
}
