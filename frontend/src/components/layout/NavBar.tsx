import { motion } from 'framer-motion';
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
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md dark:bg-surface-dark/90"
    >
      {/* 3-col grid: logo left · tabs center · toggle right */}
      <div className="grid h-[56px] grid-cols-[1fr_auto_1fr] items-center px-5">

        {/* Left */}
        <Link
          to="/"
          className="flex items-center gap-[10px] justify-self-start text-ink dark:text-ink-dark transition-opacity hover:opacity-75"
        >
          <LogoMark className="h-[26px] w-[26px]" />
          <span className="hidden text-[14px] font-semibold tracking-tight sm:block">
            PixelPilot
          </span>
        </Link>

        {/* Center — tabs with spring layoutId indicator */}
        <nav className="flex h-9 items-center gap-0.5" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={[
                  'relative flex h-9 items-center rounded-lg px-3.5 text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'text-ink dark:text-ink-dark'
                    : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
                ].join(' ')}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-bg"
                    className="absolute inset-0 rounded-lg bg-accent-subtle/70 dark:bg-accent-subtle-dark/80"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{link.label}</span>

              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center justify-self-end">
          <ThemeToggle />
        </div>

      </div>
    </motion.header>
  );
}
