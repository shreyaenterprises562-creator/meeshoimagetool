"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud } from "lucide-react";

/* ================= TYPES ================= */

interface Result {
  variantId: string;
  imageUrl: string;
}

/* ================= COMPONENT ================= */

export default function ImageWorkspace() {
  // ---------- IMAGE STATES ----------
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // ---------- TOOL STATES ----------
  const [variantCount, setVariantCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  // ---------- CATEGORY SEARCH ----------
  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // ---------- CREDIT SYSTEM ----------
  const [credits, setCredits] = useState<number>(0);
  const [adsWatched, setAdsWatched] = useState<number>(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ========================================================= */
  /* ✅ LOAD USER CREDITS FROM /api/auth/me */
  /* ========================================================= */
  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setCredits(data.user.credits);
          setAdsWatched(data.user.adsWatched);
        }
      } catch (err) {
        console.log("Credits Load Failed");
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

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  /* ================= CATEGORY SEARCH ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      if (debouncedText.length < 2) {
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);

        const res = await fetch(
          `/api/meesho/category-search?q=${debouncedText}`
        );

        const data = await res.json();

        if (data.success) {
          setSuggestions(data.categories || []);
        }
      } catch {
        console.log("Category Search Failed");
      } finally {
        setSearchLoading(false);
      }
    };

    fetchCategories();
  }, [debouncedText]);

  /* ================= OUTSIDE CLICK CLOSE ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setSearchLoading(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ========================================================= */
  /* ✅ WATCH AD & EARN CREDIT (MAX 2/DAY) */
  /* ========================================================= */
  const watchAdAndEarn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required!");

      alert("🎥 Monetag Ad Playing... (Demo)");

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

      alert("✅ +1 Credit Added!");

      setCredits(data.credits);
      setAdsWatched(data.adsWatched);
    } catch {
      alert("Ad reward failed!");
    }
  };

  /* ========================================================= */
  /* ✅ GENERATE OPTIMIZED VARIANTS */
  /* ========================================================= */
  const generateOptimizedVariants = async () => {
    if (!file) return alert("Upload image first!");

    if (credits <= 0) {
      alert("⚠️ No credits left! Watch Ad to continue.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("variants", variantCount.toString());
      formData.append("category", selectedCategory);

      const res = await fetch("/api/optimize/variants", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed!");
        setLoading(false);
        return;
      }

      // Backend already deducted credit
      setCredits((prev) => prev - 1);

      setResults(
        data.variants.map((img: string, index: number) => ({
          variantId: `OPT-${index + 1}`,
          imageUrl: img,
        }))
      );
    } catch {
      alert("Variant generation failed!");
    }

    setLoading(false);
  };

  /* ========================================================= */
  /* ✅ SHIPPING OPTIMIZATION */
  /* ========================================================= */
  const startOptimization = async () => {
    if (!file) return;

    if (credits <= 0) {
      alert("⚠️ No credits left! Watch Ad to continue.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", selectedCategory);

      const res = await fetch("/api/optimize/shipping", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        alert("Shipping failed!");
        return;
      }

      // Backend already deducted credit
      setCredits((prev) => prev - 1);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setResults([{ variantId: "SHIP-1", imageUrl: url }]);
    } catch {
      alert("Shipping optimization failed!");
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        {/* LEFT PANEL */}
        <div className="bg-white border rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Credits */}
          <div className="text-center font-bold text-sm text-gray-700">
            🎯 Credits Left:{" "}
            <span className="text-pink-600">{credits}</span>
            <p className="text-xs text-gray-400 mt-1">
              Ads Watched: {adsWatched}/2
            </p>
          </div>

          {/* Watch Ad */}
          {credits <= 0 && adsWatched < 2 && (
            <button
              onClick={watchAdAndEarn}
              className="w-full bg-yellow-400 hover:bg-yellow-500 font-bold py-3 rounded-xl transition"
            >
              🎥 Watch Ad & Earn +1 Credit
            </button>
          )}

          {/* Upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl h-[220px] flex flex-col justify-center items-center cursor-pointer hover:border-pink-500 transition"
          >
            {preview ? (
              <img
                src={preview}
                className="max-h-[200px] object-contain rounded-lg"
              />
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Click to upload image</p>
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

          {/* Category Search */}
          <div ref={dropdownRef}>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Search Category
            </p>

            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSelectedCategory("");
              }}
              placeholder="Type like lighter..."
              className="w-full border rounded-lg px-3 py-2"
            />

            {searchLoading && (
              <p className="text-xs text-gray-400 mt-2 animate-pulse">
                Searching...
              </p>
            )}

            {suggestions.length > 0 && (
              <div className="border rounded-lg mt-2 max-h-48 overflow-auto bg-white shadow">
                {suggestions.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchText(cat);
                      setSuggestions([]);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}

            {selectedCategory && (
              <p className="text-green-600 text-sm mt-2 font-semibold">
                ✅ Selected: {selectedCategory}
              </p>
            )}
          </div>

          {/* Slider */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              VARIANTS (1–500)
            </p>

            <input
              type="range"
              min={1}
              max={500}
              value={variantCount}
              onChange={(e) => setVariantCount(Number(e.target.value))}
              className="w-full accent-pink-500"
            />

            <p className="text-center text-pink-600 font-bold mt-2">
              {variantCount} Variants Selected
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={startOptimization}
              disabled={!file || loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? "Processing..." : "CALCULATE BEST SHIPPING"}
            </button>

            <button
              onClick={generateOptimizedVariants}
              disabled={!file || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
            >
              {loading
                ? "Generating..."
                : `Generate ${variantCount} Optimized Images`}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-5">Output Results</h2>

          {results.length === 0 ? (
            <div className="h-[350px] flex flex-col justify-center items-center text-gray-400">
              <UploadCloud className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Upload image and generate variants</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((r, i) => (
                <div
                  key={r.variantId}
                  className="border rounded-xl p-3 flex flex-col items-center"
                >
                  <img
                    src={r.imageUrl}
                    className="w-full rounded-lg object-cover"
                  />

                  <a
                    href={r.imageUrl}
                    download={`variant-${i + 1}.jpg`}
                    className="mt-2 text-pink-600 font-bold hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
