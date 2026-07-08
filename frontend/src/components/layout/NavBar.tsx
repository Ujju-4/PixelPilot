import { Link, useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/icons/LogoMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
// ⌘K still works as a keyboard shortcut — just no visible search bar

const NAV_LINKS = [
  { to: '/', label: 'Editor' },
  { to: '/batch', label: 'Batch' },
  { to: '/history', label: 'History' },
];

export function NavBar() {
  const { open } = useCommandPalette();
  const location = useLocation();

  useKeyboardShortcuts({ 'mod+k': open });

  return (
    <header className="sticky top-0 z-30 border-b border-border dark:border-border-dark/60 bg-surface/90 dark:bg-surface-dark/90 shadow-[0_1px_0_rgba(15,15,16,0.02)] backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4">

        {/* Left: Logo + Nav */}
        <div className="flex h-full min-w-0 items-center gap-[20px]">
          <Link
            to="/"
            className="flex h-full shrink-0 items-center gap-[12px] text-ink dark:text-ink-dark transition-opacity hover:opacity-80"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <LogoMark className="h-[32px] w-[32px]" />
            </span>
            <span className="hidden shrink-0 text-[18px] font-semibold leading-none tracking-tight sm:block">
              PixelPilot
            </span>
          </Link>

          {/* Separator */}
          <div className="hidden h-5 w-px shrink-0 bg-border dark:bg-border-dark sm:block" />

          {/* Nav tabs */}
          <nav className="flex h-9 items-center gap-0.5" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={[
                    'relative flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'text-ink dark:text-ink-dark'
                      : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
                  ].join(' ')}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg bg-canvas ring-1 ring-border/60 dark:bg-canvas-dark dark:ring-border-dark/60" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Theme toggle */}
        <div className="flex h-full shrink-0 items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
