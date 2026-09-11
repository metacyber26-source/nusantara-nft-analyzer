import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// Fungsi helper untuk penanganan retry jika terjadi error 503 / High Demand
async function generateContentWithRetry(model, content, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(content);
    } catch (error) {
      const isServiceUnavailable = error.message && (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("Unavailable"));
      if (isServiceUnavailable && i < retries - 1) {
        console.warn(`[Gemini API] Terjadi error 503/High Demand. Mencoba ulang (${i + 1}/${retries}) dalam ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
        delayMs *= 1.5; // Menambah jeda waktu tunggu
      } else {
        throw error;
      }
    }
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json(
        { error: "Gambar wajib diunggah." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di Vercel." },
        { status: 500 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gunakan nama model standar dari Google AI SDK
    // Jika gemini-1.5-flash sibuk, backend secara otomatis siap merespon
    let modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    let model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
    Kamu adalah pakar Semiotika Seni Nusantara, Filosofi Budaya, dan Master Fengshui Visual profesional.
    Analisis gambar NFT ini secara mendalam, mendetail, dan sistematis.

    INSTRUKSI UTAMA:
    1. Ekstrak **Asset ID / Token ID** yang tertulis pada gambar (terutama di pojok kanan atas, contoh: "Cat🐱#2270858" atau "#2270858"). Jika tidak ada, isi "Tidak Terdeteksi".
    2. Analisis skor keharmonisan Fengshui umum (skor 1-100) dan hitung persentase keseimbangan 5 Elemen (Wood, Fire, Earth, Metal, Water) total harus 100%.
    3. Bedah elemen-elemen berikut jika ada pada gambar:
       - body, face, tail, eyes, eyebrow, nose, ears, beard, background.
    4. Untuk tiap elemen, berikan: "visual_features", "filosofi", dan "fengshui".
    5. Berikan ringkasan energi utama (dominant_energy) dan saran penyeimbang fengshui (balancing_advice).
    6. DI AKHIR (field "disclaimer"), WAJIB menyantumkan kalimat eksak ini:
       "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini."

    Kembalikan Jawaban HANYA berupa JSON valid sesuai skema berikut tanpa Markdown/teks tambahan:
    {
      "asset_id": "ID Aset yang terbaca",
      "harmony_score": 88,
      "dominant_energy": "Energi Yang - Api & Kayu",
      "five_elements": {
        "wood": 20,
        "fire": 30,
        "earth": 15,
        "metal": 10,
        "water": 25
      },
      "balancing_advice": "Penjelasan singkat cara menyeimbangkan energi objek.",
      "elements": {
        "body": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "face": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "tail": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "eyes": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "eyebrow": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "nose": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "ears": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "beard": { "visual_features": "...", "filosofi": "...", "fengshui": "..." },
        "background": { "visual_features": "...", "filosofi": "...", "fengshui": "..." }
      },
      "disclaimer": "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini."
    }
    `;

    const contentPayload = [
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type || "image/png",
        },
      },
    ];

    // Eksekusi API dengan proteksi Retry
    let result = await generateContentWithRetry(model, contentPayload, 3, 2000);

    let responseText = result.response.text();
    responseText = responseText.replace(/```json|```/g, "").trim();

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Analysis error:", error);
    
    // Pesan ramah untuk pengguna jika Google AI masih sibuk
    let userErrorMessage = error.message || "Gagal menganalisis gambar.";
    if (userErrorMessage.includes("503") || userErrorMessage.includes("high demand")) {
      userErrorMessage = "Server Google AI sedang mengalami trafik tinggi (Error 503). Sistem telah mencoba ulang. Silakan klik tombol 'Mulai Analisis' sekali lagi.";
    }

    return NextResponse.json(
      { error: userErrorMessage },
      { status: 500 }
    );
  }
}
