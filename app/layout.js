import './globals.css';

export const metadata = {
  title: 'NFT Semiotics & Fengshui Visual Analyzer',
  description: 'Aplikasi analisis filosofi visual dan fengshui gambar NFT terstruktur JSON.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
