import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import LoginForm from './LoginForm';
import CustomerForm from './CustomerForm';

// Never indexed — also gated by the secret token segment itself.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage({ params }: { params: Promise<{ token: string }> }) {
  // "Buat Customer" writes to the `customers` table (src/lib/db.ts), not
  // the filesystem, so it works in production too now — see
  // migrations/0002_customers.sql and createCustomerAction in ./actions.ts.
  if (!isAdminConfigured()) notFound();

  const { token } = await params;
  if (!isValidAdminToken(token)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return <LoginForm token={token} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Tambah customer baru ke dalam sistem.
        </p>
      </div>

      <CustomerForm token={token} />
    </div>
  );
}
