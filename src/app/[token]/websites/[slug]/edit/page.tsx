import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { getCustomerFromDb } from '@/lib/db';
import CustomerForm from '../../../CustomerForm';
import LoginForm from '../../../LoginForm';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ token: string; slug: string }>;
}) {
  if (!isAdminConfigured()) notFound();

  const { token, slug } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return <LoginForm token={token} />;
  }

  const config = await getCustomerFromDb(slug);
  if (!config) {
    notFound();
  }

  // File-based demo sites cannot be edited via the UI since they have no DB row.
  // getCustomerFromDb already filters them out (it only reads the customers table).

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 mb-2">
        <Link
          href={`/${token}/websites`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-fit"
        >
          <CaretLeft size={16} weight="bold" />
          Kembali ke Kelola Website
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Edit Website: {config.businessName}</h1>
        <p className="text-sm text-zinc-400">
          Ubah konfigurasi, teks, dan tema warna untuk situs <span className="text-zinc-200 font-medium">{slug}</span>.
        </p>
      </div>

      <CustomerForm
        token={token}
        initialData={{ ...config, slug }}
      />
    </div>
  );
}
