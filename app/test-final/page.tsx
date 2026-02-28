"use client";

import { useState } from "react";

export default function TestFinal() {
  const [result, setResult] = useState("");

  async function handleUpload(e: any) {
    const file = e.target.files[0];

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/optimize/final", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setResult(data.optimizedBase64);
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Final Background Remove Test</h1>

      <input type="file" onChange={handleUpload} />

      {result && (
        <div>
          <h2>Output:</h2>
          <img src={result} width="400" />
        </div>
      )}
    </div>
  );
}
