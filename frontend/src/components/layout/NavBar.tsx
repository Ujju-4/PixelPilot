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
    <header className="sticky top-0 z-30 border-b border-border/40 dark:border-border-dark/60 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md">
      <div className="flex h-11 items-center justify-between px-3 gap-3">

        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink dark:text-ink-dark hover:opacity-80 transition-opacity shrink-0"
          >
            <LogoMark className="h-6 w-6" />
            <span className="hidden sm:block text-sm font-semibold tracking-tight">PixelPilot</span>
            <span className="hidden sm:block text-xs text-ink-secondary dark:text-ink-dark-secondary font-normal">AI</span>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block h-4 w-px bg-border dark:bg-border-dark shrink-0" />

          {/* Nav tabs */}
          <nav className="flex items-center gap-0.5" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={[
                    'relative px-2.5 py-1 text-xs font-medium rounded transition-all duration-150',
                    isActive
                      ? 'text-ink dark:text-ink-dark'
                      : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark hover:bg-canvas dark:hover:bg-canvas-dark',
                  ].join(' ')}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded bg-canvas dark:bg-canvas-dark ring-1 ring-border/50 dark:ring-border-dark/50" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Theme */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={open}
            aria-label="Open command palette (⌘K)"
            className="hidden sm:inline-flex items-center gap-2 rounded border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-2.5 py-1 text-xs text-ink-secondary dark:text-ink-dark-secondary transition-all hover:text-ink dark:hover:text-ink-dark hover:border-border dark:hover:border-border-dark"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>Search</span>
            <kbd className="font-mono text-[10px] opacity-40 tracking-tight">⌘K</kbd>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
