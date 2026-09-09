import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    visualDescription: {
      type: Type.STRING,
      description: "Deskripsi obyektif visual secara keseluruhan."
    },
    elementsAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { 
            type: Type.STRING, 
            description: "Bagian gambar: body, face, tail, eyes, eyebrow, nose, ears, beard, atau background" 
          },
          attributesFound: {
            type: Type.OBJECT,
            properties: {
              shape: { type: Type.STRING, description: "Bentuk terdeteksi" },
              motif: { type: Type.STRING, description: "Motif/tekstur terdeteksi" },
              color: { type: Type.STRING, description: "Warna dominan/aksen" }
            },
            required: ["shape", "motif", "color"]
          },
          philosophicalMeaning: { 
            type: Type.STRING, 
            description: "Arti filosofis berdasarkan atribut tersebut." 
          },
          fengShuiAnalysis: { 
            type: Type.STRING, 
            description: "Analisis fengshui (5 elemen, aliran qi, hoki/keseimbangan)." 
          }
        },
        required: ["part", "attributesFound", "philosophicalMeaning", "fengShuiAnalysis"]
      }
    }
  },
  required: ["visualDescription", "elementsAnalysis"]
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Gambar tidak ditemukan' });
    }

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/png'
      }
    };

    const prompt = `
      Bertindaklah sebagai ahli semiotika, filosofi visual, dan praktisi Fengshui profesional.
      Tugasmu adalah menganalisis GAMBAR INI SECARA OBYEKTIF berdasarkan apa yang benar-benar terlihat.
      
      Analisis elemen-elemen berikut jika ada pada gambar:
      1. Body (Tubuh), 2. Face (Wajah), 3. Tail (Ekor), 4. Eyes (Mata), 5. Eyebrow (Alis),
      6. Nose (Hidung), 7. Ears (Telinga), 8. Beard (Janggut/Kumis), 9. Background (Latar Belakang).

      Untuk setiap elemen yang ditemukan:
      - Identifikasi spesifik **Bentuk (Shape)**, **Motif/Tekstur (Motif)**, dan **Warna (Color)** yang nyata terlihat.
      - Berikan **Arti Filosofis** dan **Analisis Fengshui** (5 elemen, aliran Qi, proteksi, atau keberuntungan).
      
      Aturan Penting:
      - Beda gambar wajib menghasilkan beda arti.
      - Abaikan bagian yang tidak ada di gambar.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.2
      }
    });

    const data = JSON.parse(response.text);
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menganalisis gambar', details: err.message });
  }
}
