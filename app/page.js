"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file terlebih dahulu!");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || "Gagal menghubungi server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 max-w-4xl mx-auto overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-4">NFT Semiotics & Fengshui Analyzer</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-md transition"
        >
          {loading ? "Menganalisis..." : "Mulai Analisis Semiotika & Fengshui"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-slate-800 p-4 rounded-lg border border-slate-700 max-w-full overflow-hidden">
          <h2 className="text-lg font-semibold mb-2">Hasil Analisis (Format JSON)</h2>
          
          {/* Bagian ini yang membuat teks tidak memanjang ke samping */}
          <pre className="bg-slate-950 p-4 rounded text-sm font-mono text-green-400 whitespace-pre-wrap break-words overflow-x-auto max-w-full">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
