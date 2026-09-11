"use client";

import React, { useState, useEffect } from "react";

export default function FengshuiAnalyzer() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedStatus, setCopiedStatus] = useState("");

  // 1. MUAT DATA TERSIMPAN DARI LOCALSTORAGE SAAT HALAMAN DIBUKA
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

  // 2. TANGANI UPLOAD GAMBAR BARU (OTOMATIS HAPUS HASIL LAMA)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);

      // Hapus hasil analisis lama dari State & Storage saat gambar baru diunggah
      setAnalysisResult(null);
      setErrorMsg("");
      localStorage.removeItem("nusantara_ai_fengshui_last_result");
      
      // Simpan preview gambar sementara
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("nusantara_ai_fengshui_last_image", reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 3. FUNGSI HAPUS HASIL/RESET MANUAL
  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setErrorMsg("");
    localStorage.removeItem("nusantara_ai_fengshui_last_result");
    localStorage.removeItem("nusantara_ai_fengshui_last_image");
  };

  // 4. SUBMIT DENGAN PEMANGGILAN BACKEND API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !imagePreview) {
      setErrorMsg("Pilih atau unggah gambar aset terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      } else {
        // Jika menggunakan gambar yang di-cache
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

      // Simpan ke state & LocalStorage
      setAnalysisResult(data);
      localStorage.setItem("nusantara_ai_fengshui_last_result", JSON.stringify(data));

    } catch (err) {
      if (err.message.includes("503") || err.message.includes("Service Unavailable")) {
        setErrorMsg(
          "⚠️ Server Gemini 3.6 Flash sedang sibuk tinggi. Silakan klik tombol 'Mulai Analisis' sekali lagi."
        );
      } else {
        setErrorMsg(err.message || "Terjadi kesalahan saat analisis.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 5. GENERATE TEKS FORMAT OPSI 1 + PENAFIAN / DISCLAIMER
  const generateOption1Text = (data) => {
    if (!data) return "";

    const assetId = data.asset_id || "Aset Digital";
    const score = data.harmony_score || 0;
    const dominantEnergy = data.dominant_energy || "Keseimbangan Unsur";
    const advice = data.balancing_advice || "Gunakan penataaan warna yang harmonis.";
    const disclaimer = data.disclaimer || "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini.";

    return `🔮 BEDAH HOKI NFT: ${assetId} 🔮

🆔 ID: ${assetId}
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

  // 6. FITUR SHARE MULTI-PLATFORM
  const handleShare = (platform) => {
    const fullText = generateOption1Text(analysisResult);
    if (!fullText) return;

    const encodedText = encodeURIComponent(fullText);
    const pageUrl = encodeURIComponent(window.location.href);

    switch (platform) {
      case "facebook":
        // Facebook membagikan URL dan teks ringkas
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedText}`,
          "_blank"
        );
        break;

      case "x":
        // Versi ringkas untuk X agar tidak melampaui limit karakter
        const shortTextX = `🔮 BEDAH HOKI NFT: ${analysisResult.asset_id}\n📈 Skor Harmoni: ${analysisResult.harmony_score}/100\n⚡ Aura: ${analysisResult.dominant_energy}\n\nAnalisis lengkap Nusantara AI:\n`;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortTextX)}&url=${pageUrl}`,
          "_blank"
        );
        break;

      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
        break;

      case "instagram":
        // Salin teks ke Clipboard lalu buka IG
        navigator.clipboard.writeText(fullText);
        setCopiedStatus("Teks Opsi 1 disalin! Silakan paste/tempel di Postingan/Story Instagram.");
        setTimeout(() => setCopiedStatus(""), 4000);
        window.open("https://www.instagram.com", "_blank");
        break;

      case "tiktok":
        // Salin teks ke Clipboard lalu buka TikTok
        navigator.clipboard.writeText(fullText);
        setCopiedStatus("Teks Opsi 1 disalin! Silakan paste/tempel di Deskripsi TikTok.");
        setTimeout(() => setCopiedStatus(""), 4000);
        window.open("https://www.tiktok.com", "_blank");
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400">
            Nusantara AI - NFT Fengshui & Filosofi Visual
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Unggah karya seni digital Anda untuk membedah filosofi kebudayaan, makna semiotika visual, serta keseimbangan energi 5 Elemen Fengshui secara presisi.
          </p>
        </div>

        {/* UPLOAD FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Pilih File Gambar NFT:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          {/* PREVIEW GAMBAR & TOMBOL RESET */}
          {imagePreview && (
            <div className="relative mt-4 flex flex-col items-center">
              <img
                src={imagePreview}
                alt="NFT Preview"
                className="max-h-72 rounded-lg border border-slate-700 object-contain"
              />
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 text-xs bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
              >
                🗑️ Hapus Gambar & Hasil
              </button>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-600 text-red-200 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
          >
            {loading ? "⏳ Menganalisis Energi & Semiotika..." : "🔮 Mulai Analisis Fengshui & Filosofi"}
          </button>
        </form>

        {/* HASIL ANALISIS OPSI 1 */}
        {analysisResult && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
              <h2 className="text-xl font-bold text-amber-400 mb-3 text-center">
                ☯️ HASIL ANALISIS SEMIOTIKA & FENGSHUI NUSANTARA AI ☯️
              </h2>

              <div className="whitespace-pre-line text-sm text-slate-200 font-mono bg-slate-900/90 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {generateOption1Text(analysisResult)}
              </div>
            </div>

            {/* STATUS COPY TO CLIPBOARD */}
            {copiedStatus && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-center text-sm rounded-lg animate-pulse">
                {copiedStatus}
              </div>
            )}

            {/* TOMBOL SHARE MULTI MEDSOS */}
            <div>
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Bagikan Hasil ke Media Sosial:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button
                  onClick={() => handleShare("facebook")}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare("x")}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 border border-slate-600"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => handleShare("instagram")}
                  className="py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  Instagram
                </button>
                <button
                  onClick={() => handleShare("tiktok")}
                  className="py-2 px-3 bg-black hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                >
                  TikTok
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="col-span-2 md:col-span-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
