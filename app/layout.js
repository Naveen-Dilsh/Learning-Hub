import "./globals.css"
import { Providers } from "@/components/providers"
import { Inter, Maname, Shrikhand } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const sinhala = Maname({
  subsets: ["sinhala"],
  weight: ["400"],
  variable: "--font-sinhala",
})

const shrikhand = Shrikhand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
})

export const metadata = {
  title: "SmartLearn LMS - Modern Learning Platform",
  description: "Secure Video Learning Platform with Interactive Courses",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sinhala.variable} ${shrikhand.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
