import "./globals.css"
import { Providers } from "@/components/providers"
import { Inter, Maname, Shrikhand } from "next/font/google"

// ✅ GOOD - Only 3 weights
const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '600', '700'], // Only what you use
  display: "swap",
  variable: "--font-sans",
  preload: true, // Load faster
})

const sinhala = Maname({
  subsets: ["sinhala"],
  weight: ["400"], // Add bold too
  variable: "--font-sinhala",
  display: "swap",
  preload: true,
})

const shrikhand = Shrikhand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
  preload: true,
})


export const metadata = {
  title: "ePencil Academy ",
  description: "Secure Video Learning Platform with Interactive Courses",
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
