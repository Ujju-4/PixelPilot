import { Link, useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/icons/LogoMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

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
    <header className="sticky top-0 z-30 border-b border-border/60 dark:border-border-dark/60 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md">
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

        {/* Right: Search + Theme */}
        <div className="flex h-full shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={open}
            aria-label="Open command palette (⌘K)"
            className="hidden h-9 min-w-[168px] items-center gap-2 rounded-lg border border-border/60 bg-canvas px-3 text-sm text-ink-secondary transition-colors hover:border-border hover:text-ink dark:border-border-dark/60 dark:bg-canvas-dark dark:text-ink-dark-secondary dark:hover:border-border-dark dark:hover:text-ink-dark sm:flex"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="flex-1 text-left">Search</span>
            <kbd className="font-mono text-[10px] tracking-tight opacity-50">⌘K</kbd>
          </button>

          <div className="flex h-9 shrink-0 items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
