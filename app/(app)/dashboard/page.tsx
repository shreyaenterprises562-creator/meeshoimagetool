"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Script from "next/script"
import { Upload, ImageIcon, Zap, History, Crown } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  /* ===================================================== */
  /* ✅ LOAD USER */
  /* ===================================================== */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        window.location.href = "/login"
        return
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()

        if (!data.success) {
          localStorage.removeItem("token")
          window.location.href = "/login"
          return
        }

        setUser(data.user)
      } catch {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }

      setLoading(false)
    }

    fetchUser()
  }, [])

  /* ===================================================== */
  /* ✅ BUY CREDITS */
  /* ===================================================== */
  const buyCredits = async (pack: string) => {
    const token = localStorage.getItem("token")

    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pack }),
    })

    const data = await res.json()

    if (!data.orderId) {
      alert("Order creation failed")
      return
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Meesho Image Tool",
      description: "Credit Purchase",
      order_id: data.orderId,

      handler: async function (response: any) {
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        })

        const verifyData = await verifyRes.json()

        if (verifyData.success) {
          alert("✅ Payment successful! Credits added.")
          window.location.reload()
        } else {
          alert("❌ Payment verification failed")
        }
      },

      theme: { color: "#22c55e" },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  /* ===================================================== */
  /* ✅ LOADING */
  /* ===================================================== */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading Dashboard...
      </div>
    )
  }

  const isLifetime = user?.premiumPlan === "lifetime"

  const expiryText =
    user?.premiumUntil && !isLifetime
      ? new Date(user.premiumUntil).toDateString()
      : "Never Expires"

  const planName =
    user?.premiumPlan === "weekly"
      ? "7 Days Plan"
      : user?.premiumPlan === "monthly"
      ? "Monthly Plan"
      : user?.premiumPlan === "yearly"
      ? "Yearly Plan"
      : user?.premiumPlan === "lifetime"
      ? "Lifetime Premium"
      : "Free User"

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard 🚀</h1>
          <p className="text-gray-600 mt-1">
            Welcome <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        <Link
          href="/optimize"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white"
        >
          <Zap size={18} />
          Optimize Now
        </Link>
      </div>

      {/* Premium Status */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10 border">
        <div className="flex items-center gap-3">
          <Crown className="text-yellow-500" />
          <h2 className="text-xl font-bold">Premium Status</h2>
        </div>

        {user?.isPremium ? (
          <div className="mt-3">
            <p className="text-green-600 font-bold text-lg">
              ✅ Premium Active
            </p>
            <p className="mt-1">Plan: {planName}</p>
            <p className="mt-1">Expiry: {expiryText}</p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-red-500 font-bold">
              ❌ Free User (Limited Credits)
            </p>
          </div>
        )}
      </div>

      {/* Credits */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <History />
        <h2 className="font-semibold text-lg mt-2">Credits Left</h2>
        <p className="text-3xl font-bold mt-4 text-pink-600">
          {user?.credits ?? 0}
        </p>

        {!user?.isPremium && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <button
              onClick={() => buyCredits("small")}
              className="bg-black text-white py-2 rounded-xl"
            >
              ₹49 → 10 Credits
            </button>

            <button
              onClick={() => buyCredits("medium")}
              className="bg-black text-white py-2 rounded-xl"
            >
              ₹99 → 25 Credits
            </button>

            <button
              onClick={() => buyCredits("large")}
              className="bg-green-600 text-white font-bold py-2 rounded-xl"
            >
              ₹199 → 60 Credits
            </button>
          </div>
        )}

        {user?.isPremium && (
          <p className="text-green-600 mt-3 font-bold">
            Unlimited Credits Active 🚀
          </p>
        )}
      </div>
    </div>
  )
}