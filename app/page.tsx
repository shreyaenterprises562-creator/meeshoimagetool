"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);

  // ✅ Token State
  const [token, setToken] = useState<string | null>(null);

  // ✅ Plan Dropdown State
  const [plan, setPlan] = useState("monthly");

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  /* ===================================================== */
  /* ✅ LOGOUT */
  /* ===================================================== */
  const logout = () => {
    localStorage.removeItem("token");
    alert("✅ Logged out successfully!");
    window.location.reload();
  };

  /* ===================================================== */
  /* ✅ CONNECT MEESHO */
  /* ===================================================== */
  const connectMeesho = async () => {
    try {
      setLoadingConnect(true);

      if (!token) {
        alert("❌ Please login first");
        return;
      }

      const res = await fetch("/api/meesho/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      alert(data.message || data.error);
    } catch {
      alert("❌ Connect failed");
    } finally {
      setLoadingConnect(false);
    }
  };

  /* ===================================================== */
  /* ✅ PREMIUM UPGRADE WITH PLAN DROPDOWN */
  /* ===================================================== */
  const upgradePremium = async () => {
    try {
      setLoadingPremium(true);

      if (!token) {
        alert("❌ Please login first");
        return;
      }

      const res = await fetch("/api/premium/upgrade", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        // ✅ Send selected plan
        body: JSON.stringify({
          plan: plan,
        }),
      });

      const data = await res.json();
      alert(data.message || data.error);

      window.location.reload();
    } catch {
      alert("❌ Upgrade failed");
    } finally {
      setLoadingPremium(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===================================================== */}
      {/* ✅ NAVBAR */}
      {/* ===================================================== */}
      <header className="w-full px-10 py-6 flex justify-between items-center bg-white shadow-sm">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🚀 Meesho Image Tool
        </h1>

        {/* Right Buttons */}
        <div className="flex items-center gap-4">
          {/* Login / Logout */}
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

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Optimize Tool */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold text-gray-900">
              ⚡ Optimize Product Image
            </h2>

            <p className="text-gray-600 text-sm">
              Upload product image, generate variants, reduce delivery charges.
            </p>

            <Link
              href="/optimize"
              className="mt-auto px-5 py-3 rounded-xl bg-pink-600 text-white text-center font-bold hover:bg-pink-700 transition"
            >
              Start Optimizing →
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold text-gray-900">
              💎 Premium Plan
            </h2>

            <p className="text-gray-600 text-sm">
              Choose your plan & unlock unlimited usage.
            </p>

            {/* ✅ Plan Dropdown */}
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-gray-800 font-semibold"
            >
              <option value="weekly">₹49 — 7 Days Plan</option>
              <option value="monthly">₹179 — Monthly Plan</option>
              <option value="yearly">₹1499 — Yearly Plan</option>
              <option value="lifetime">₹7999 — Lifetime Plan</option>
            </select>

            {/* Upgrade Button */}
            <button
              onClick={upgradePremium}
              disabled={loadingPremium}
              className="mt-auto px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loadingPremium ? "Upgrading..." : "Upgrade Premium →"}
            </button>
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold text-gray-900">
              📦 Optimization History
            </h2>

            <p className="text-gray-600 text-sm">
              View optimized variants & best shipping results.
            </p>

            <Link
              href="/dashboard"
              className="mt-auto px-5 py-3 rounded-xl bg-black text-white text-center font-bold hover:bg-gray-800 transition"
            >
              View Dashboard →
            </Link>
          </div>

          {/* Meesho Connect */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border">
            <h2 className="text-xl font-semibold text-gray-900">
              🔗 Meesho Automation
            </h2>

            <p className="text-gray-600 text-sm">
              Connect supplier account for delivery automation.
            </p>

            <button
              onClick={connectMeesho}
              disabled={loadingConnect}
              className="mt-auto px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingConnect ? "Connecting..." : "Connect Now →"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Meesho Image Tool ❤️
      </footer>
    </div>
  );
}
