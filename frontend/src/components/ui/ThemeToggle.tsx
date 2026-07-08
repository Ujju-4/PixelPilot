import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 24;
const KNOB_SIZE = 16;
const PADDING = 4;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - PADDING * 2;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        padding: PADDING,
        backgroundImage: isDark
          ? 'linear-gradient(to bottom, #0f1b3d, #060e24)'
          : 'linear-gradient(to bottom, #8fcbf4, #5aa9ec)',
        boxShadow: isDark
          ? '0 0 0 3px rgba(37,99,235,0.22), inset 0 0 0 1px rgba(255,255,255,0.06)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.25)',
      }}
      className="relative inline-flex shrink-0 items-center rounded-full transition-[filter,box-shadow] duration-300 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface-dark"
    >
      {/* stars — fade in for dark mode */}
      <span
        aria-hidden="true"
        style={{ left: 5, top: 4, width: 2, height: 2 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity duration-300 ${isDark ? 'opacity-90' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        style={{ left: 10, top: 13, width: 2, height: 2 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity delay-75 duration-300 ${isDark ? 'opacity-70' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        style={{ left: 17, top: 6, width: 1.5, height: 1.5 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity delay-150 duration-300 ${isDark ? 'opacity-60' : 'opacity-0'}`}
      />

      {/* cloud — fades in for light mode */}
      <span
        aria-hidden="true"
        style={{ right: 5, top: 6, width: 7, height: 4 }}
        className={`pointer-events-none absolute rounded-full bg-white/80 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* sliding knob */}
      <motion.span
        style={{ width: KNOB_SIZE, height: KNOB_SIZE }}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
        animate={{ x: isDark ? KNOB_TRAVEL : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -80, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-[#0f1b3d]"
            >
              <MoonIcon className="h-2.5 w-2.5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 80, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-amber-500"
            >
              <SunIcon className="h-2.5 w-2.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
