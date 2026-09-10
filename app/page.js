"use client";

import { useState } from "react";
import { Upload, FileCode, Check, Copy, Download, RefreshCw } from "lucide-react";

export default function Home() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);

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
      alert("Terjadi kesalahan saat menganalisis gambar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nft-analysis-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-amber-400">
          NFT Semiotics & Fengshui Visual Analyzer
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Menganalisis elemen visual NFT secara aktual berbasis Filosofi Budaya, Semiotika Seni, dan Fengshui Visual terstruktur.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" /> Upload Gambar NFT
          </h2>

          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="NFT Preview"
                className="max-h-60 rounded-lg object-contain"
              />
            ) : (
              <div className="space-y-2 text-slate-400">
                <Upload className="w-10 h-10 mx-auto text-slate-500" />
                <p className="text-sm">Klik atau seret gambar NFT ke sini</p>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP hingga 10MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Menganalisis Fitur Visual...
              </>
            ) : (
              "Mulai Analisis Semiotika & Fengshui"
            )}
          </button>
        </div>

        {/* Panel Output JSON */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" /> Hasil Analisis (Format JSON)
            </h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  title="Salin JSON"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  title="Unduh JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto text-emerald-400 max-h-[400px]">
            {result ? (
              <pre>{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <span className="text-slate-600">
                JSON output analisis akan muncul di sini setelah gambar diproses...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tampilan Disclaimer */}
      {result && result.disclaimer && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300/90 text-xs text-center">
          {result.disclaimer}
        </div>
      )}
    </div>
  );
}
