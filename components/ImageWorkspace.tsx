"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud } from "lucide-react";

interface Result {
  variantId: string;
  imageUrl: string;
}

export default function ImageWorkspace() {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [variantCount, setVariantCount] = useState(5);
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const [credits, setCredits] = useState<number>(0);
  const [adsWatched, setAdsWatched] = useState<number>(0);

  const fileRef = useRef<HTMLInputElement>(null);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    async function loadUser() {

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setCredits(data.user.credits);
        setAdsWatched(data.user.adsWatched);
      }
    }

    loadUser();
  }, []);

  /* ================= IMAGE SELECT ================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults([]);
  };

  /* ================================================= */
  /* 🎥 WATCH AD & EARN CREDIT */
  /* ================================================= */

  const watchAdAndEarn = async () => {

    try {

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required!");
        return;
      }

      if (adsWatched >= 2) {
        alert("Daily ad limit reached");
        return;
      }

      //@ts-ignore
      if (window.show_217509) {
        //@ts-ignore
        await window.show_217509();
      } else {
        alert("Ad loading... try again");
        return;
      }

      const res = await fetch("/api/credits/watch-ad", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      setCredits(data.credits);
      setAdsWatched(data.adsWatched);

      alert("✅ +1 Credit Added!");

    } catch {

      alert("Ad failed");

    }
  };

  /* ================================================= */
  /* GENERATE VARIANTS */
  /* ================================================= */

  const generateOptimizedVariants = async () => {

    if (!file) {
      alert("Upload image first!");
      return;
    }

    if (credits <= 0) {
      alert("⚠️ No credits left! Watch Ad first.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("variants", variantCount.toString());
      formData.append("category", category);

      const res = await fetch("/api/optimize/variants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setCredits((prev) => prev - 1);

      setResults(
        data.variants.map((img: string, i: number) => ({
          variantId: `OPT-${i + 1}`,
          imageUrl: img,
        }))
      );

    } catch {
      alert("Optimize failed");
    }

    setLoading(false);
  };

  /* ================================================= */
  /* SHIPPING OPTIMIZATION */
  /* ================================================= */

  const startOptimization = async () => {

    if (!file) return;

    if (credits <= 0) {
      alert("⚠️ No credits left! Watch Ad first.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/optimize/shipping", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setCredits((prev) => prev - 1);

      setResults([{ variantId: "SHIP", imageUrl: url }]);

    } catch {
      alert("Shipping failed");
    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">

        <div className="bg-white border rounded-2xl p-6 space-y-6 shadow-sm">

          <div className="text-center font-bold text-sm">
            🎯 Credits Left: {credits}
            <p className="text-xs text-gray-400">
              Ads Watched: {adsWatched}/2
            </p>
          </div>

          {credits <= 0 && adsWatched < 2 && (
            <button
              onClick={watchAdAndEarn}
              className="w-full bg-yellow-400 hover:bg-yellow-500 font-bold py-3 rounded-xl"
            >
              🎥 Watch Ad & Earn +1 Credit
            </button>
          )}

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl h-[220px] flex flex-col justify-center items-center cursor-pointer"
          >
            {preview ? (
              <img src={preview} className="max-h-[200px]" />
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Upload image</p>
              </>
            )}

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <input
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="range"
            min={1}
            max={50}
            value={variantCount}
            onChange={(e) => setVariantCount(Number(e.target.value))}
            className="w-full"
          />

          <p className="text-center text-sm">
            {variantCount} Variants
          </p>

          <button
            onClick={startOptimization}
            disabled={!file || loading}
            className="w-full bg-pink-600 text-white py-3 rounded-xl"
          >
            {loading ? "Processing..." : "CALCULATE BEST SHIPPING"}
          </button>

          <button
            onClick={generateOptimizedVariants}
            disabled={!file || loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Generating...
              </span>
            ) : (
              `Generate ${variantCount} Images`
            )}
          </button>

        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">

          {results.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              Upload image and optimize
            </div>
          ) : (
            <>
              <h3 className="font-semibold mb-4">
                Generated Variants ({results.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {results.map((r, i) => (
                  <div
                    key={r.variantId}
                    className="border rounded-xl p-2 bg-gray-50"
                  >
                    <img
                      src={r.imageUrl}
                      className="rounded-lg mb-2"
                    />

                    <a
                      href={r.imageUrl}
                      download={`variant-${i}.jpg`}
                      className="block text-center bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800"
                    >
                      ⬇ Download
                    </a>

                  </div>
                ))}

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}