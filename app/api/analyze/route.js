import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

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
    
    // Menggunakan nama model yang kompatibel dengan API v1beta
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash-latest" });

    const prompt = `
    Kamu adalah seorang pakar Semiotika Seni, Filosofi Budaya, dan Praktisi Fengshui Visual profesional.
    Tugas utamanya adalah menganalisis gambar NFT ini secara spesifik, aktual, detail, dan canggih berdasarkan fitur visual nyata yang ada pada gambar.

    INSTRUKSI:
    1. Bedah elemen-elemen berikut satu per satu (bentuk, motif, warna):
       - body, face, tail, eyes, eyebrow, nose, ears, beard, background.
    2. Untuk setiap elemen, berikan "visual_features", "filosofi", dan "fengshui".
    3. DI AKHIR (field "disclaimer"), WAJIB menyantumkan kalimat eksak ini:
       "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini."
    4. Kembalikan Jawaban HANYA berupa JSON valid sesuai skema berikut:
    {
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type || "image/png",
        },
      },
    ]);

    let responseText = result.response.text();
    responseText = responseText.replace(/```json|```/g, "").trim();

    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menganalisis gambar." },
      { status: 500 }
    );
  }
}
