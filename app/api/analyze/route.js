import { NextResponse } from "next/server";

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

    // CATATAN: Di sini kamu bisa menyambungkan ke Vision AI API (seperti Gemini 1.5 Flash / GPT-4o)
    // dengan mengirimkan gambar dan prompt instruksi semiotika & fengshui.
    
    // Berikut struktur payload JSON standar hasil analisis:
    const mockAnalysisResult = {
      meta: {
        analyzed_at: new Date().toISOString(),
        status: "success"
      },
      elements: {
        body: {
          visual_features: "Postur tegap dengan motif sisik keemasan berpola simetris.",
          filosofi: "Menyimbolkan ketangguhan spiritual, ketahanan mental, serta posisi kepemimpinan yang kokoh.",
          fengshui: "Unsur Tanah kuat dan aksen Logam. Membawa energi Yang stabil untuk kestabilan karir dan wibawa."
        },
        face: {
          visual_features: "Bentuk rahang tegas berwarna merah keunguan.",
          filosofi: "Menggambarkan keberanian ekspresif dan intensitas emosional yang terkontrol.",
          fengshui: "Unsur Api dominan. Mendorong popularitas, ekspansi bisnis, dan energi keberanian."
        },
        tail: {
          visual_features: "Ekor melengkung ke atas dengan ujung bulu keemasan.",
          filosofi: "Simbol kesinambungan cita-cita dan artikulasi gagasan yang dinamis.",
          fengshui: "Gerakan aliran Qi melingkar positif, menjaga agar aliran rezeki tidak cepat lepas."
        },
        eyes: {
          visual_features: "Mata tajam berwarna hijau zamrud berbinar.",
          filosofi: "Tajamnya intuisi, kejernihan visi masa depan, dan kejujuran nurani.",
          fengshui: "Unsur Kayu bertumpu pada pandangan tajam. Mengundang peluang pertumbuhan investasi."
        },
        eyebrow: {
          visual_features: "Alis tebal menanjak berwarna hitam pekat.",
          filosofi: "Ketegasan keputusan dan sifat pantang menyerah dalam menghadapi krisis.",
          fengshui: "Energi Pertahanan. Melindungi pemilik dari manipulasi atau energi Chi buruk (Sha Qi)."
        },
        nose: {
          visual_features: "Hidung proporsional melengkung tajam di bagian pangkal.",
          filosofi: "Keseimbangan dalam menyaring masukan dan fokus pada esensi nilai.",
          fengshui: "Merupakan gudang rezeki (Istana Hidung/財帛宮). Menandakan pengelolaan keuangan yang disiplin."
        },
        ears: {
          visual_features: "Telinga lebar memanjang ke belakang berhias anting perak.",
          filosofi: "Keberlanjutan dalam mendengarkan kearifan dan keterbukaan pada ilmu baru.",
          fengshui: "Unsur Air halus. Menjaga keharmonisan komunikasi dan koneksi hubungan kerja."
        },
        beard: {
          visual_features: "Bulu wajah tipis berwarna perak keabu-abuan.",
          filosofi: "Kematangan berpikir dan kemandirian dalam mengambil langkah strategis.",
          fengshui: "Aksen Logam halus. Menyeimbangkan energi Api agar tidak memicu kekhawatiran berlebih."
        },
        background: {
          visual_features: "Latar gradasi biru tua menuju keemasan dengan efek partikel cahaya.",
          filosofi: "Kedalaman potensi yang belum terikat, dikombinasikan dengan fajar harapan baru.",
          fengshui: "Perpaduan Unsur Air (Biru) dan Logam/Tanah (Emas). Menciptakan siklus harmonis penerimaan keberuntungan."
        }
      },
      disclaimer: "Analisis ini merupakan pendapat pribadi berbasis interpretasi filosofi dan fengshui visual, serta dapat berbeda dengan pandangan pihak lain. Hasil analisis ini bersifat informatif, tidak perlu diperdebatkan, dan tidak wajib diyakini."
    };

    return NextResponse.json(mockAnalysisResult);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses analisis gambar." },
      { status: 500 }
    );
  }
}
