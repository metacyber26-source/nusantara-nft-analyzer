"use client";

import React, { useState, useEffect } from "react";

export default function FengshuiAnalyzer() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedStatus, setCopiedStatus] = useState("");
  const [isCopiedText, setIsCopiedText] = useState(false);

  // 1. MUAT DATA TERSIMPAN
  useEffect(() => {
    const savedData = localStorage.getItem("nusantara_ai_fengshui_last_result");
    const savedImage = localStorage.getItem("nusantara_ai_fengshui_last_image");
    
    if (savedData) {
      try {
        setAnalysisResult(JSON.parse(savedData));
      } catch (e) {
        console.error("Gagal membaca cache:", e);
      }
    }
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  // 2. UPLOAD GAMBAR BARU (AUTO-CLEAR)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);

      setAnalysisResult(null);
      setErrorMsg("");
      localStorage.removeItem("nusantara_ai_fengshui_last_result");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("nusantara_ai_fengshui_last_image", reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 3. RESET MANUAL
  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setErrorMsg("");
    localStorage.removeItem("nusantara_ai_fengshui_last_result");
    localStorage.removeItem("nusantara_ai_fengshui_last_image");
  };

  // 4. SUBMIT DENGAN AUTO-RETRY
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !imagePreview) {
      setErrorMsg("⚠️ Pilih atau unggah gambar aset NFT terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      } else {
        const blob = await fetch(imagePreview).then((r) => r.blob());
        formData.append("image", blob, "cached_image.png");
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses gambar.");
      }

      setAnalysisResult(data);
      localStorage.setItem("nusantara_ai_fengshui_last_result", JSON.stringify(data));

    } catch (err) {
      if (err.message.includes("503") || err.message.includes("Service Unavailable")) {
        setErrorMsg(
          "🌐 Server Gemini 3.6 Flash sedang mengalami trafik tinggi. Silakan tekan tombol 'Mulai Analisis' sekali lagi."
        );
      } else {
        setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 5. GENERATE TEKS OPSI 1 + DISCLAIMER
  const generateOption1Text = (data) => {
    if (!data) return "";

    const assetId = data.asset_id || "Aset Digital";
    const score = data.harmony_score || 0;
    const dominantEnergy = data.dominant_energy || "Keseimbangan Unsur";
    const advice = data.balancing_advice || "Gunakan penataan warna yang harmonis.";
    const disclaimer = data.disclaimer || "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini.";

    return `🔮 BEDAH HOKI NFT: ${assetId} 🔮

🆔 ID Aset: ${assetId}
📈 Skor Harmoni: ${score}/100 (Kategori: Harmonis)
⚡ Aura Dominan: ${dominantEnergy}

Ringkasan Keberuntungan Visual:
• 💖 Body & Face: ${data.elements?.body?.fengshui || "Keseimbangan energi hubungan sosial (Ren Yan)."}
• ⚡ Tail/Ekor: ${data.elements?.tail?.fengshui || "Dorongan energi dinamis dan proteksi spiritual."}
• 💎 Eyes/Mata: ${data.elements?.eyes?.fengshui || "Puncak elemen Api (Kua Li) pembawa karisma & popularitas."}
• 🌌 Aura/Kumis: ${data.elements?.beard?.fengshui || "Memancarkan aura perlindungan dan wibawa."}

📊 Kesimpulan & Saran:
${advice}

📌 CATATAN IMPORTANT:
${disclaimer}

#NusantaraAI #FengshuiNFT #Web3Indonesia #CryptoArtIndonesia #NFTAnalysis`;
  };

  // 6. FUNGSI COPY TO CLIPBOARD TEKS UTAMA
  const handleCopyText = () => {
    const fullText = generateOption1Text(analysisResult);
    if (!fullText) return;

    navigator.clipboard.writeText(fullText);
    setIsCopiedText(true);
    setCopiedStatus("✨ Teks hasil analisis berhasil disalin ke clipboard!");
    setTimeout(() => {
      setIsCopiedText(false);
      setCopiedStatus("");
    }, 3000);
  };

  // 7. FITUR SHARE MULTI-PLATFORM
  const handleShare = (platform) => {
    const fullText = generateOption1Text(analysisResult);
    if (!fullText) return;

    const encodedText = encodeURIComponent(fullText);
    const pageUrl = encodeURIComponent(window.location.href);

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedText}`, "_blank");
        break;
      case "x":
        const shortTextX = `🔮 BEDAH HOKI NFT: ${analysisResult.asset_id}\n📈 Skor Harmoni: ${analysisResult.harmony_score}/100\n⚡ Aura: ${analysisResult.dominant_energy}\n\nAnalisis lengkap Nusantara AI:\n`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shortTextX)}&url=${pageUrl}`, "_blank");
        break;
      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
        break;
      case "instagram":
        navigator.clipboard.writeText(fullText);
        setCopiedStatus("📋 Teks disalin! Silakan paste di Postingan/Story Instagram Anda.");
        setTimeout(() => setCopiedStatus(""), 4000);
        window.open("https://www.instagram.com", "_blank");
        break;
      case "tiktok":
        navigator.clipboard.writeText(fullText);
        setCopiedStatus("📋 Teks disalin! Silakan paste di Deskripsi TikTok Anda.");
        setTimeout(() => setCopiedStatus(""), 4000);
        window.open("https://www.tiktok.com", "_blank");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black">
      
      {/* GLOW DEKORATIF METAVERSE */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* CARD UTAMA KACA METAVERSE (GLASSMORPHISM) */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
          
          {/* HEADER METAVERSE */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <span>☯️ Cybernetic Fengshui Engine</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight">
              NUSANTARA AI METAVERSE
            </h1>
            <p className="text-cyan-300/80 text-xs md:text-sm max-w-2xl mx-auto font-light leading-relaxed">
              Membedah filosofi kebudayaan Nusantara, makna semiotika visual, dan keseimbangan energi 5 Elemen Fengshui pada aset digital Anda secara presisi.
            </p>
          </div>

          {/* UPLOAD FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-amber-300/90">
                Pilih / Unggah Gambar Aset NFT:
              </label>
              
              <div className="relative flex items-center justify-center w-full border-2 border-dashed border-amber-500/30 group-hover:border-amber-400 rounded-2xl bg-slate-950/60 p-6 transition duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="text-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl">
                    🔮
                  </div>
                  <p className="text-sm font-medium text-slate-300">
                    {file ? file.name : "Klik atau geser gambar NFT ke area ini"}
                  </p>
                  <p className="text-xs text-slate-500">Format PNG, JPG, WEBP hingga 10MB</p>
                </div>
              </div>
            </div>

            {/* PREVIEW GAMBAR & TOMBOL RESET */}
            {imagePreview && (
              <div className="relative mt-6 flex flex-col items-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <img
                  src={imagePreview}
                  alt="NFT Preview"
                  className="max-h-80 rounded-xl border border-amber-500/20 object-contain shadow-2xl"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <span>🗑️</span> Hapus Gambar & Reset Hasil
                </button>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/80 border border-rose-500 text-rose-200 text-sm rounded-xl backdrop-blur-md">
                {errorMsg}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base rounded-2xl transition duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:opacity-50 tracking-wider uppercase"
            >
              {loading ? "⏳ Mentranskripsi Energi Fengshui & Semiotika..." : "🔮 Mulai Analisis Fengshui & Filosofi"}
            </button>
          </form>

          {/* HASIL ANALISIS */}
          {analysisResult && (
            <div className="mt-10 pt-8 border-t border-amber-500/20 space-y-6">
              
              {/* HEADER HASIL & TOMBOL COPY PASTE */}
              <div className="bg-slate-950/90 rounded-2xl p-6 border border-amber-500/40 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                  <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
                    <span>☯️</span> HASIL ANALISIS OPSI 1
                  </h2>

                  {/* TOMBOL COPY PASTE (DITAMBAHKAN) */}
                  <button
                    onClick={handleCopyText}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition duration-300 flex items-center justify-center gap-2 border shadow-lg ${
                      isCopiedText
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20"
                        : "bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/40"
                    }`}
                  >
                    <span>{isCopiedText ? "✓" : "📋"}</span>
                    <span>{isCopiedText ? "Teks Berhasil Disalin!" : "Copy Teks Analisis"}</span>
                  </button>
                </div>

                {/* HASIL TEKS DALAM KOTAK FONT MONO METAVERSE */}
                <div className="whitespace-pre-line text-xs md:text-sm text-slate-300 font-mono bg-slate-900/90 p-5 rounded-xl border border-slate-800 leading-relaxed overflow-x-auto selection:bg-amber-500 selection:text-slate-950">
                  {generateOption1Text(analysisResult)}
                </div>
              </div>

              {/* UMPAN BALIK COPYS TIKTOK/IG/CLIPBOARD */}
              {copiedStatus && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-center text-xs font-semibold rounded-xl animate-pulse">
                  {copiedStatus}
                </div>
              )}

              {/* SHARE MEDIA SOSIAL */}
              <div className="space-y-3">
                <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Bagikan Hasil ke Media Sosial:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="py-3 px-4 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold rounded-xl border border-blue-400/30 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare("x")}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-600 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    X (Twitter)
                  </button>
                  <button
                    onClick={() => handleShare("instagram")}
                    className="py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold rounded-xl border border-pink-400/30 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => handleShare("tiktok")}
                    className="py-3 px-4 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    TikTok
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="col-span-2 md:col-span-1 py-3 px-4 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl border border-emerald-400/30 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
