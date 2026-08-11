import type { Metadata } from 'next';
import { MAIN_DOMAIN } from '@/lib/customers';

export const metadata: Metadata = {
  title: 'Website Dinonaktifkan',
  robots: { index: false, follow: false },
};

// Reached via proxy.ts rewriting requests to a suspended customer's
// subdomain/custom domain here, instead of falling through to the main
// marketing homepage (which is what happened before this route existed —
// NextResponse.next() with an unrewritten "/" path renders the homepage
// regardless of hostname).
export default function SiteSuspendedPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col items-center gap-5">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-2xl font-black">
          !
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-outfit">
          Website Ini Telah Dinonaktifkan
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Website ini sedang tidak aktif — kemungkinan karena masalah pembayaran atau permintaan pemiliknya. Jika Anda
          adalah pemilik website ini, silakan hubungi kami via WhatsApp untuk mengaktifkan kembali.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <a
            href={`https://${MAIN_DOMAIN}`}
            className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors"
          >
            Kembali ke Halaman Utama
          </a>
          <a
            href="https://wa.me/6281339684249?text=Halo%20WebbinAja,%20website%20saya%20nonaktif%2C%20mohon%20info."
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-transparent border border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-white/5 transition-colors"
          >
            Hubungi WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
