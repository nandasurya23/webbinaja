import type { Metadata } from 'next';
import OrderForm from './OrderForm';

export const metadata: Metadata = {
  title: 'Pesan Website — WebbinAja',
  description: 'Isi data bisnis Anda dan kami buatkan website-nya dalam 24 jam.',
};

export default function PesanPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <main className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white font-outfit mb-2">
          Pesan Website Anda
        </h1>
        <p className="text-zinc-400 mb-10">
          Isi data bisnis Anda di bawah ini. Setelah terkirim, Anda akan diarahkan ke WhatsApp untuk pembayaran.
        </p>
        <OrderForm />
      </main>
    </div>
  );
}
