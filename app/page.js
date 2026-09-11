"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  Sparkles,
  Upload,
  Share2,
  Copy,
  Check,
  Compass,
  AlertCircle,
  History,
  Download,
  Eye,
  RefreshCw,
  ShieldAlert,
  Flame,
  Droplets,
  Trees,
  Mountain,
  Coins
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [historyNotice, setHistoryNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [historyList, setHistoryList] = useState([]);

  const resultRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("nft_analyzed_history") || "[]");
      setHistoryList(saved);
    } catch (e) {
      console.error(e);
    }
  };

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

  const saveToHistory = (data, imagePreviewUrl) => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem("nft_analyzed_history") || "[]");
      const assetId = data.asset_id || "Aset Tanpa ID";
      
      const isExist = savedHistory.some(item => item.asset_id === assetId && assetId !== "Tidak Terdeteksi");
      if (isExist) {
        setHistoryNotice(`⚠️ Perhatian: Aset dengan ID "${assetId}" sudah pernah dianalisis sebelumnya pada perangkat ini!`);
      }

      const newItem = {
        asset_id: assetId,
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
        harmony_score: data.harmony_score || 85,
        preview: imagePreviewUrl,
        data: data
      };

      const filtered = savedHistory.filter(item => item.asset_id !== assetId);
      const updated = [newItem, ...filtered].slice(0, 8); // Simpan 8 riwayat terakhir
      localStorage.setItem("nft_analyzed_history", JSON.stringify(updated));
      setHistoryList(updated);
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
      saveToHistory(data, preview);
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedSummaryText = () => {
    if (!result) return "";
    let text = `☯️ HASIL ANALISIS SEMIOTIKA & FENGSHUI NUSANTARA AI ☯️\n`;
    text += `🆔 ID Aset: ${result.asset_id || "Tidak Terdeteksi"}\n`;
    text += `🔮 Skor Harmoni: ${result.harmony_score || 80}/100\n`;
    text += `⚡ Energi Dominan: ${result.dominant_energy || "-"}\n\n`;

    if (result.elements) {
      Object.entries(result.elements).forEach(([key, val]) => {
        if (val) {
          text += `🔹 [ELEMEN: ${key.toUpperCase()}]\n`;
          if (val.visual_features) text += `• Fitur: ${val.visual_features}\n`;
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

  const downloadCertificate = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#070a12",
        scale: 2,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Fengshui-Analysis-${result?.asset_id || "NFT"}.png`;
      link.click();
    } catch (err) {
      alert("Gagal mengunduh kartu analisis gambar.");
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(`Hasil analisis Filosofi & Fengshui NFT (${result?.asset_id || "Aset"}) Skor Harmoni: ${result?.harmony_score || 80}/100 ✨\n`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <header className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Nusantara AI Quantum Semiotics
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight gold-gradient-text drop-shadow-sm">
          NFT Fengshui & Filosofi Visual
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Unggah karya seni digital Anda untuk membedah filosofi kebudayaan, makna semiotika visual, serta keseimbangan energi 5 Elemen Fengshui secara presisi.
        </p>
      </header>

      {/* Main Form Box */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 gold-border-glow transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/70 bg-slate-900/40 hover:bg-slate-900/60 transition-all rounded-2xl p-6 text-center cursor-pointer group flex flex-col items-center justify-center min-h-[180px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="relative group/img">
                <img
                  src={preview}
                  alt="Preview Aset NFT"
                  className="max-h-56 rounded-xl border border-amber-500/40 object-contain shadow-2xl"
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition text-xs text-amber-300 font-semibold">
                  Klik untuk mengganti gambar
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform border border-amber-500/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Klik atau seret gambar NFT ke sini</p>
                  <p className="text-xs text-slate-500 mt-1">Mendukung format PNG, JPG, WEBP (Ekstraksi Token ID Otomatis)</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 tracking-wide uppercase cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Membedah Energi & Semiotika Aset...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Mulai Analisis Fengshui & Filosofi
              </>
            )}
          </button>
        </form>

        {/* Notifikasi Riwayat / Warning */}
        {historyNotice && (
          <div className="mt-4 p-4 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <p>{historyNotice}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}
      </section>

      {/* Riwayat Analisis Cepat (Baru) */}
      {historyList.length > 0 && !result && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <History className="w-4 h-4" /> Riwayat Analisis Terakhir
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {historyList.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setResult(item.data)}
                className="glass-card p-3 rounded-xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition space-y-2 group"
              >
                <div className="h-24 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center relative">
                  {item.preview ? (
                    <img src={item.preview} alt={item.asset_id} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <Eye className="w-6 h-6 text-slate-600" />
                  )}
                  <span className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-amber-400 font-bold">
                    {item.harmony_score} pt
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 truncate">{item.asset_id}</p>
                  <p className="text-[10px] text-slate-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HASIL ANALISIS LENGKAP */}
      {result && (
        <section className="space-y-6 animate-fadeIn" ref={resultRef}>
          {/* Header Ringkasan & Action Bar */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">Aset ID Terdeteksi</span>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {result.asset_id || "Tidak Terdeteksi"}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin" : "Salin Teks"}
                </button>
                
                <button
                  onClick={downloadCertificate}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Gambar
                </button>

                <button
                  onClick={shareToX}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-xs font-semibold rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share 𝕏
                </button>
              </div>
            </div>

            {/* Skor Harmoni & Diagram 5 Elemen (Fitur Baru) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Box Skor */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-amber-500/20 text-center space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Skor Keseimbangan Fengshui</span>
                <div className="text-4xl font-black gold-gradient-text">
                  {result.harmony_score || 85}<span className="text-sm font-normal text-slate-500">/100</span>
                </div>
                <p className="text-xs text-amber-400 font-medium">{result.dominant_energy || "Energi Harmonis"}</p>
              </div>

              {/* Box 5 Elemen (Wu Xing) */}
              <div className="md:col-span-2 bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Komposisi 5 Elemen (Wu Xing):</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-emerald-400"><Trees className="w-4 h-4" /></div>
                    <div className="text-slate-400">Kayu</div>
                    <div className="font-bold text-slate-200">{result.five_elements?.wood || 20}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-red-400"><Flame className="w-4 h-4" /></div>
                    <div className="text-slate-400">Api</div>
                    <div className="font-bold text-slate-200">{result.five_elements?.fire || 20}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-amber-600"><Mountain className="w-4 h-4" /></div>
                    <div className="text-slate-400">Tanah</div>
                    <div className="font-bold text-slate-200">{result.five_elements?.earth || 20}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-slate-300"><Coins className="w-4 h-4" /></div>
                    <div className="text-slate-400">Logam</div>
                    <div className="font-bold text-slate-200">{result.five_elements?.metal || 20}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-blue-400"><Droplets className="w-4 h-4" /></div>
                    <div className="text-slate-400">Air</div>
                    <div className="font-bold text-slate-200">{result.five_elements?.water || 20}%</div>
                  </div>
                </div>
                {result.balancing_advice && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                    💡 <strong className="text-amber-400">Saran Harmonisasi:</strong> {result.balancing_advice}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tab Filter Navigasi */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            {["all", "visual", "filosofi", "fengshui"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  activeTab === tab
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "all" ? "Semua Detail" : tab}
              </button>
            ))}
          </div>

          {/* Grid Elemen Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.elements || {}).map(([key, item]) => {
              if (!item) return null;
              return (
                <div key={key} className="glass-card p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      Bagian: {key}
                    </span>
                  </div>

                  {(activeTab === "all" || activeTab === "visual") && item.visual_features && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Fitur Visual</h5>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        {item.visual_features}
                      </p>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "filosofi") && item.filosofi && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wide">Makna Filosofi</h5>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        {item.filosofi}
                      </p>
                    </div>
                  )}

                  {(activeTab === "all" || activeTab === "fengshui") && item.fengshui && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wide">Analisis Fengshui</h5>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        {item.fengshui}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer Statis */}
          {result.disclaimer && (
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
