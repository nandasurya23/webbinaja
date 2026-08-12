'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  SquaresFour, 
  Envelope, 
  Globe, 
  UsersThree, 
  SignOut, 
  List,
  X
} from '@phosphor-icons/react/dist/ssr';
import { logoutAction } from '@/app/[token]/actions';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

type DashboardShellProps = {
  token: string;
  role?: string;
  children: React.ReactNode;
};

type SidebarContentProps = {
  token: string;
  role?: string;
  pathname: string;
  isLoggingOut: boolean;
  handleLogout: () => void;
};

function SidebarContent({ token, role, pathname, isLoggingOut, handleLogout }: SidebarContentProps) {
  const navItems = [
    { name: 'Dashboard', href: `/${token}`, exact: true, icon: SquaresFour },
    { name: 'Inbox Submission', href: `/${token}/inbox`, exact: false, icon: Envelope },
    { name: 'Websites', href: `/${token}/websites`, exact: false, icon: Globe },
  ];

  if (role === 'super_admin') {
    navItems.push({ name: 'Kelola Admin', href: `/${token}/manage-admins`, exact: false, icon: UsersThree });
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 backdrop-blur-xl border-r border-white/5 text-zinc-300">
      <div className="p-6">
        <div className="flex items-center gap-3 font-semibold text-white">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 overflow-hidden">
            <Image src="/logos.png" alt="Logo" fill className="object-contain p-1" sizes="32px" />
          </div>
          <span className="tracking-tight text-lg">WebbinAja</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 mt-4">Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
              }`}
            >
              <item.icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-blue-500" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <SignOut size={18} />
          {isLoggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  );
}

function useMobileMenu(pathname: string | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  return [isOpen, setIsOpen] as const;
}

export default function DashboardShell({ token, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useMobileMenu(pathname);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction(token);
    router.refresh();
  };



  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent token={token} role={role} pathname={pathname ?? ''} isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold text-white">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 overflow-hidden">
            <Image src="/logos.png" alt="Logo" fill className="object-contain p-1" sizes="28px" />
          </div>
          <span>WebbinAja</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
        >
          <List size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm z-50 lg:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent token={token} role={role} pathname={pathname ?? ''} isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        {/* Subtle background glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
        
        <div className="relative z-10 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
