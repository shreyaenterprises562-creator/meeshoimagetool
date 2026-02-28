"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    alert("✅ Account Created! Now Login");

    router.push("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">
          Register Account 🚀
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
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
        >
          {loading ? "Creating..." : "Register →"}
        </button>

        <p className="text-sm text-gray-500 mt-5 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 font-bold underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
