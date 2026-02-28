"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      setLoading(false);
      return;
    }

    // ✅ Save Token
    localStorage.setItem("token", data.token);

    alert("✅ Login Successful!");

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">
          Login to Meesho Tool 🚀
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl px-4 py-3 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl px-4 py-3 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 transition"
        >
          {loading ? "Logging in..." : "Login →"}
        </button>

        <p className="text-sm text-gray-500 mt-5 text-center">
          No account?{" "}
          <a href="/register" className="text-black font-bold underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
