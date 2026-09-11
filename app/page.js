// Ganti blok penanganan error di handleSubmit() page.js menjadi seperti ini:
} catch (err) {
  if (err.message.includes("503") || err.message.includes("lonjakan lalu lintas")) {
    setErrorMsg("⚠️ Server AI Google sedang dipadati trafik tinggi. Sistem telah mencoba menghubungi ulang namun server masih sibuk. Silakan tekan tombol 'Mulai Analisis' sekali lagi.");
  } else {
    setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
  }
} finally {
  setLoading(false);
}
