"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [historyNotice, setHistoryNotice] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setErrorMsg(null);
      setHistoryNotice(null);
    }
  };

  const checkHistory = (assetId) => {
    if (!assetId || assetId === "Tidak Terdeteksi") return;
    try {
      const savedHistory = JSON.parse(localStorage.getItem("nft_analyzed_ids") || "[]");
      if (savedHistory.includes(assetId)) {
        setHistoryNotice(`⚠️ Perhatian: Aset ID "${assetId}" pernah dianalisis sebelumnya di perangkat ini!`);
      } else {
        const updated = [...savedHistory, assetId];
        localStorage.setItem("nft_analyzed_ids", JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Silakan pilih gambar terlebih dahulu!");

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setHistoryNotice(null);

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
      if (data.asset_id) {
        checkHistory(data.asset_id);
      }
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedSummaryText = () => {
    if (!result) return "";
    let text = `✨ HASIL ANALISIS NFT SEMIOTICS & FENGSHUI ✨\n`;
    text += `🆔 ID Aset: ${result.asset_id || "Tidak Terdeteksi"}\n\n`;

    if (result.elements) {
      Object.entries(result.elements).forEach(([key, val]) => {
        if (val) {
          text += `🔹 [${key.toUpperCase()}]\n`;
          if (val.visual_features) text += `• Visual: ${val.visual_features}\n`;
          if (val.filosofi) text += `• Filosofi: ${val.filosofi}\n`;
          if (val.fengshui) text += `• Fengshui: ${val.fengshui}\n\n`;
        }
      });
    }

    if (result.disclaimer) {
      text += `📌 ${result.disclaimer}`;
    }
    return text;
  };

  const handleCopy = () => {
    const text = getFormattedSummaryText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const text = getFormattedSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hasil Analisis NFT: ${result?.asset_id || "NFT"}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      handleCopy();
      alert("Fitur Share otomatis tidak didukung browser ini. Hasil analisis sudah disalin ke clipboard!");
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(`Hasil analisis Semiotika & Fengshui NFT (${result?.asset_id || "Aset"}):\n${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareToFB = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-2xl mx-auto font-sans pb-20">
      <header className="text-center my-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          NFT Semiotics & Fengshui Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Analisis visual, filosofi, dan fengshui otomatis untuk NFT Anda
        </p>
      </header>

      {/* Form Upload */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Unggah Gambar NFT (ID Aset Kanan Atas Terdeteksi Otomatis):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
        </div>

        {preview && (
          <div className="flex justify-center my-3 relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 rounded-xl border border-slate-700 object-contain shadow-md"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg"
        >
          {loading ? "Sedang Menganalisis Aset..." : "Mulai Analisis"}
        </button>
      </form>

      {/* Pesan Error */}
      {errorMsg && (
        <div className="mt-6 p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs leading-relaxed break-words whitespace-pre-wrap">
          <p className="font-bold mb-1">Gagal Menganalisis:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Alert Jika ID Pernah Menganalisis */}
      {historyNotice && (
        <div className="mt-6 p-4 bg-amber-950/90 border border-amber-700 rounded-xl text-amber-200 text-xs leading-relaxed shadow-lg">
          {historyNotice}
        </div>
      )}

      {/* Hasil Analisis */}
      {result && result.elements && (
        <section className="mt-8 space-y-6">
          {/* Header ID Aset & Action Buttons */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-indigo-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">ID Aset Terdeteksi</span>
              <h2 className="text-xl font-extrabold text-white">
                {result.asset_id || "Tidak Terdeteksi"}
              </h2>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition"
              >
                {copied ? "✓ Tersalin!" : "📋 Salin Ringkasan"}
              </button>
              
              <button
                onClick={handleNativeShare}
                className="flex-1 sm:flex-none px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white transition shadow"
              >
                📲 Berbagi
              </button>
            </div>
          </div>

          {/* Quick Share Medsos */}
          <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Bagikan Langsung:</span>
            <div className="flex gap-2">
              <button
                onClick={shareToX}
                className="px-2.5 py-1 bg-black text-slate-200 hover:bg-slate-900 rounded-md border border-slate-700 text-[11px]"
              >
                𝕏 / Twitter
              </button>
              <button
                onClick={shareToFB}
                className="px-2.5 py-1 bg-blue-600 text-white hover:bg-blue-500 rounded-md text-[11px]"
              >
                Facebook
              </button>
              <button
                onClick={handleNativeShare}
                className="px-2.5 py-1 bg-pink-600 text-white hover:bg-pink-500 rounded-md text-[11px]"
              >
                IG / TikTok / WA
              </button>
            </div>
          </div>

          {/* Daftar Elemen Visual */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-slate-200">Detail Semiotika & Fengshui Visual:</h3>
            
            {Object.entries(result.elements).map(([key, item]) => {
              if (!item) return null;
              return (
                <div key={key} className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-2.5 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-1">
                    Elemen: {key}
                  </h4>

                  {item.visual_features && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100">Fitur Visual:</strong> {item.visual_features}
                    </p>
                  )}

                  {item.filosofi && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100">Filosofi:</strong> {item.filosofi}
                    </p>
                  )}

                  {item.fengshui && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100">Fengshui:</strong> {item.fengshui}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          {result.disclaimer && (
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 mt-6">
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
