import type { Metadata } from 'next';
import StatusCheckForm from './StatusCheckForm';

export const metadata: Metadata = {
  title: 'Cek Status Pesanan — WebbinAja',
  description: 'Cek status pengerjaan dan pembayaran pesanan website Anda.',
  robots: { index: false, follow: false },
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <main className="max-w-md mx-auto px-6 py-16 sm:py-24">
        <h1 className="text-3xl font-black tracking-tighter text-white font-outfit mb-2">Cek Status Pesanan</h1>
        <p className="text-zinc-400 mb-10 text-sm">
          Masukkan nomor WhatsApp dan kode yang diberikan setelah Anda mengisi form pemesanan.
        </p>
        <StatusCheckForm />
      </main>
    </div>
  );
}
