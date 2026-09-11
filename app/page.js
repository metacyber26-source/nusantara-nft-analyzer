"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Silakan pilih gambar terlebih dahulu!");

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal memproses gambar.");
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-xl mx-auto font-sans">
      <header className="text-center my-6">
        <h1 className="text-2xl font-bold text-indigo-400">
          NFT Semiotics & Fengshui Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Analisis visual, filosofi, dan fengshui untuk NFT kamu
        </p>
      </header>

      {/* Form Upload */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Unggah Gambar NFT:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
        </div>

        {preview && (
          <div className="flex justify-center my-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-56 rounded-lg border border-slate-700 object-contain"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-lg text-sm transition"
        >
          {loading ? "Sedang Menganalisis..." : "Mulai Analisis"}
        </button>
      </form>

      {/* Pesan Error */}
      {errorMsg && (
        <div className="mt-6 p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs leading-relaxed break-words">
          <p className="font-bold mb-1">Gagal Menganalisis:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Hasil Analisis Rapi */}
      {result && result.elements && (
        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2">
            Hasil Analisis Visual
          </h2>

          <div className="space-y-4">
            {Object.entries(result.elements).map(([key, item]) => {
              if (!item) return null;
              return (
                <div key={key} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                    Elemen: {key}
                  </h3>

                  {item.visual_features && (
                    <p className="text-xs text-slate-300">
                      <strong className="text-slate-200">Fitur Visual:</strong> {item.visual_features}
                    </p>
                  )}

                  {item.filosofi && (
                    <p className="text-xs text-slate-300">
                      <strong className="text-slate-200">Filosofi:</strong> {item.filosofi}
                    </p>
                  )}

                  {item.fengshui && (
                    <p className="text-xs text-slate-300">
                      <strong className="text-slate-200">Fengshui:</strong> {item.fengshui}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {result.disclaimer && (
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 mt-4">
              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
