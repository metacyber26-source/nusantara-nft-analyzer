import './globals.css';

export const metadata = {
  title: 'Nusantara AI - Fengshui & Filosofi Visual NFT',
  description: 'Aplikasi analisis tingkat tinggi untuk Semiotika Visual, Filosofi Nusantara, dan Harmoni Fengshui pada Aset Digital NFT.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
