import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Jasa Web 1 Hari — Website Bisnis Siap Pakai dalam 24 Jam',
  description:
    'Pilih dari 8 template premium (barbershop, restoran, gym, petshop, bakery, rental, dan lainnya), kirim data bisnis Anda via WhatsApp, website Anda live dalam 24 jam.',
  keywords: ['jasa website', 'website bisnis', 'website UMKM', 'jasa web 1 hari', 'template website'],
  openGraph: {
    title: 'Jasa Web 1 Hari — Website Bisnis Siap Pakai dalam 24 Jam',
    description: 'Pilih template, kirim data via WhatsApp, website Anda live dalam 24 jam.',
    images: ['/logos.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Jasa Web 1 Hari',
    description: 'Website bisnis siap pakai dalam 24 jam.',
  },
};

export default function Home() {
  return <HomeClient />;
}
