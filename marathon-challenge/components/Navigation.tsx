// Minimal, Modern Navigation Bar
// Calm, editorial design inspired by premium finance + wellness apps

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SyncButton from './SyncButton';

interface NavigationProps {
  stravaAthleteId?: string;
  needsSync?: boolean;
}

export default function Navigation({ stravaAthleteId, needsSync }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/zoom-out', label: 'Zoom Out' },
    { href: '/balance', label: 'Balance' },
    // { href: '/goals', label: 'Goals' }, // Uncomment when Goals page exists
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  // Generate breadcrumb text
  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return null;
    if (pathname === '/zoom-out') return 'DASHBOARD → ZOOM OUT';
    if (pathname === '/balance') return 'DASHBOARD → BALANCE';
    if (pathname === '/goals') return 'DASHBOARD → GOALS';
    return null;
  };

  const breadcrumb = getBreadcrumb();

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/dashboard" className="text-lg sm:text-xl font-light text-[#1a1f2e] tracking-wide hover:text-[#4b5563] transition-colors">
                RUNNING
              </Link>
            </div>

            {/* Center: Navigation Items */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      text-xs
                      uppercase
                      tracking-wider
                      font-medium
                      text-[#6b7280]
                      transition-colors
                      duration-200
                      hover:text-[#1a1f2e]
                      ${active ? 'text-[#1a1f2e]' : ''}
                    `}
                  >
                    {item.label}
                    {/* Active underline */}
                    <span 
                      className={`
                        absolute bottom-0 left-0 right-0 h-px bg-[#1a1f2e] 
                        transition-opacity duration-200
                        ${active ? 'opacity-100' : 'opacity-0'}
                      `}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {stravaAthleteId && (
                <SyncButton
                  stravaAthleteId={stravaAthleteId}
                  needsSync={needsSync}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb (subtle, below nav) */}
      {breadcrumb && (
        <div className="bg-white/40 backdrop-blur-sm border-b border-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="h-8 flex items-center">
              <span className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-light">
                {breadcrumb}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

