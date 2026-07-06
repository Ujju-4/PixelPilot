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
    <header className="sticky top-0 z-30 border-b border-border/50 dark:border-border-dark/50 bg-canvas/80 dark:bg-canvas-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <LogoMark className="h-7 w-7" />
            <span className="hidden sm:block text-sm">PixelPilot AI</span>
          </Link>

          {/* Nav links — pill-shaped */}
          <nav className="flex items-center gap-0.5 rounded-full border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark p-0.5" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-ink dark:bg-ink-dark text-canvas dark:text-canvas-dark shadow-sm'
                      : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            aria-label="Open command palette (⌘K)"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border/60 dark:border-border-dark/60 bg-surface dark:bg-surface-dark px-3 py-1.5 text-xs text-ink-secondary dark:text-ink-dark-secondary transition-colors hover:text-ink dark:hover:text-ink-dark"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Search actions
            <kbd className="font-mono text-[10px] opacity-50">⌘K</kbd>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
