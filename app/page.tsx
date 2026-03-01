"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loadingConnect, setLoadingConnect] = useState(false)
  const [loadingPremium, setLoadingPremium] = useState(false)
  const [plan, setPlan] = useState("monthly")

  /* ===================================================== */
  /* ✅ SAFE CLIENT LOAD */
  /* ===================================================== */
  useEffect(() => {
    setMounted(true)
    setToken(localStorage.getItem("token"))
  }, [])

  if (!mounted) return null

  /* ===================================================== */
  /* ✅ LOGOUT */
  /* ===================================================== */
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  /* ===================================================== */
  /* ✅ CONNECT MEESHO */
  /* ===================================================== */
  const connectMeesho = async () => {
    if (!token) {
      alert("❌ Please login first")
      return
    }

    try {
      setLoadingConnect(true)

      const res = await fetch("/api/meesho/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      alert(data.message || data.error)
    } catch {
      alert("❌ Connect failed")
    } finally {
      setLoadingConnect(false)
    }
  }

  /* ===================================================== */
  /* ✅ PREMIUM UPGRADE */
  /* ===================================================== */
  const upgradePremium = async () => {
    if (!token) {
      alert("❌ Please login first")
      return
    }

    try {
      setLoadingPremium(true)

      const res = await fetch("/api/premium/upgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()
      alert(data.message || data.error)
    } catch {
      alert("❌ Upgrade failed")
    } finally {
      setLoadingPremium(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= NAVBAR ================= */}
      <header className="w-full px-10 py-6 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          🚀 Meesho Image Tool
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

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Optimize */}
          <Card
            title="⚡ Optimize Product Image"
            desc="Upload product image, generate variants & reduce delivery charges."
            link="/optimize"
            button="Start Optimizing →"
            color="bg-pink-600 hover:bg-pink-700"
          />

          {/* Premium */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold">💎 Premium Plan</h2>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 font-semibold"
            >
              <option value="weekly">₹49 — 7 Days</option>
              <option value="monthly">₹179 — Monthly</option>
              <option value="yearly">₹1499 — Yearly</option>
              <option value="lifetime">₹7999 — Lifetime</option>
            </select>

            <button
              onClick={upgradePremium}
              disabled={loadingPremium}
              className="mt-auto px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {loadingPremium ? "Upgrading..." : "Upgrade Premium →"}
            </button>
          </div>

          {/* History */}
          <Card
            title="📦 Optimization History"
            desc="View optimized variants & shipping results."
            link="/dashboard"
            button="View Dashboard →"
            color="bg-black hover:bg-gray-800"
          />

          {/* Meesho */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold">🔗 Meesho Automation</h2>
            <p className="text-sm text-gray-600">
              Connect supplier account for automation.
            </p>

            <button
              onClick={connectMeesho}
              disabled={loadingConnect}
              className="mt-auto px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingConnect ? "Connecting..." : "Connect Now →"}
            </button>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Meesho Image Tool ❤️
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
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-600 text-sm">{desc}</p>
      <Link
        href={link}
        className={`mt-auto px-5 py-3 rounded-xl text-white text-center font-bold transition ${color}`}
      >
        {button}
      </Link>
    </div>
  )
}