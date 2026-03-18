"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {

  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setToken(localStorage.getItem("token"))
  }, [])

  if (!mounted) return null

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ================= NAVBAR ================= */}

      <header className="w-full px-10 py-6 flex justify-between items-center bg-white shadow-sm">

        <h1 className="text-2xl font-bold text-gray-900">
          🚀 Optaimager
        </h1>

        <div className="flex items-center gap-4">

          {!token ? (
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition"
            >
              Logout
            </button>
          )}

          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="text-center py-16 px-6">

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Free Meesho Shipping Image Generator
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate optimized Meesho catalog images that help reduce shipping charges.
          Upload your product photo and instantly create ready-to-upload ecommerce
          catalog images for Meesho sellers.
        </p>

      </section>

      {/* ================= MAIN ================= */}

      <main className="flex-1 flex flex-col items-center px-6 pb-20">

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Catalog Generator */}

          <Card
            title="⚡ Catalog Image Generator"
            desc="Upload product image and generate ready-to-upload Meesho catalog images instantly."
            link="/optimize"
            button="Generate Images →"
            color="bg-green-600 hover:bg-green-700"
          />

          {/* Premium Disabled */}

          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border relative opacity-70">

            <h2 className="text-xl font-semibold line-through">
              💎 Premium Plan
            </h2>

            <p className="text-sm text-gray-500 line-through">
              Unlimited images and advanced optimization features.
            </p>

            <div className="mt-auto text-center text-sm font-semibold bg-yellow-400 rounded-lg py-2">
              🚧 1 Month Free Soon
            </div>

          </div>

          {/* Dashboard */}

          <Card
            title="📦 Image History"
            desc="View and download your previously generated catalog images."
            link="/dashboard"
            button="Open Dashboard →"
            color="bg-black hover:bg-gray-800"
          />

          {/* Automation Disabled */}

          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border relative opacity-70">

            <h2 className="text-xl font-semibold line-through">
              🔗 Meesho Automation
            </h2>

            <p className="text-sm text-gray-500 line-through">
              Connect supplier account and automate product image generation.
            </p>

            <div className="mt-auto text-center text-sm font-semibold bg-yellow-400 rounded-lg py-2">
              🚧 Coming Soon
            </div>

          </div>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Optaimager — Free Meesho Shipping Image Generator
      </footer>

    </div>
  )
}


/* ================= REUSABLE CARD ================= */

function Card({
  title,
  desc,
  link,
  button,
  color,
}: {
  title: string
  desc: string
  link: string
  button: string
  color: string
}) {

  return (

    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">

      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="text-gray-600 text-sm">
        {desc}
      </p>

      <Link
        href={link}
        className={`mt-auto px-5 py-3 rounded-xl text-white text-center font-bold transition ${color}`}
      >
        {button}
      </Link>

    </div>

  )
}