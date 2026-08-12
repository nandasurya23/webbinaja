import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, parseSession, isValidAdminToken } from '@/lib/adminAuth';
import DashboardShell from '@/components/ui/DashboardShell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  if (!isValidAdminToken(token)) {
    notFound();
  }

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  // If there's no session, we render the children (which will be the LoginForm)
  // directly without the dashboard shell, so the user sees a clean login page.
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-blue-500/30 selection:text-blue-200">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          {children}
        </div>
      </div>
    );
  }

  // If logged in, wrap the content in the dashboard shell
  return (
    <DashboardShell token={token} role={session.role}>
      {children}
    </DashboardShell>
  );
}
