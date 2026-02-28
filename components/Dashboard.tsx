"use client";

import React, { useEffect, useState } from "react";

interface User {
  email: string;
  isPremium: boolean;
  credits: number;
}

interface DashboardProps {
  user?: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  // -------------------------
  // SAFE USER (no undefined crash)
  // -------------------------
  const safeUser: User = user || {
    email: "guest@meeshooptima.com",
    isPremium: false,
    credits: 1,
  };

  // -------------------------
  // MEESHO STATUS
  // -------------------------
  const [meeshoConnected, setMeeshoConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // -------------------------
  // CHECK STATUS ON LOAD
  // -------------------------
  useEffect(() => {
    fetch("/api/meesho/status")
      .then((res) => res.json())
      .then((data) => {
        setMeeshoConnected(Boolean(data.connected));
      })
      .catch(() => {
        setMeeshoConnected(false);
      });
  }, []);

  // -------------------------
  // CONNECT MEESHO
  // -------------------------
  const connectMeesho = async () => {
    try {
      setConnecting(true);
      console.log("CONNECT MEESHO CLICKED");

      const res = await fetch("/api/meesho/connect", {
        method: "POST",
      });

      const data = await res.json();
      alert(data.message);

      // 🔁 Re-check status after login
      setTimeout(async () => {
        const statusRes = await fetch("/api/meesho/status");
        const statusData = await statusRes.json();
        setMeeshoConnected(Boolean(statusData.connected));
      }, 2000);
    } catch (err) {
      alert("Failed to connect Meesho");
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        Welcome back, {safeUser.email}
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Images Used Today</p>
          <p className="text-xl font-bold">1</p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Avg. Shipping Savings</p>
          <p className="text-xl font-bold text-green-600">₹14.50</p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Credits Remaining</p>
          <p className="text-xl font-bold">
            {safeUser.isPremium ? "∞" : safeUser.credits}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-xl font-bold text-purple-600">98.2%</p>
        </div>
      </div>

      {/* MEESHO CONNECT */}
      <div className="border rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Meesho Account</h2>
          <p className="text-sm text-gray-500">
            Connect your Meesho seller account to calculate real shipping charges
          </p>
        </div>

        <button
          onClick={connectMeesho}
          disabled={meeshoConnected || connecting}
          className={`px-6 py-3 rounded-lg font-bold transition ${
            meeshoConnected
              ? "bg-green-600 text-white cursor-default"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {meeshoConnected
            ? "Meesho Connected ✅"
            : connecting
            ? "Connecting..."
            : "Connect Meesho"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
