import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 28;
const KNOB_SIZE = 22;
const PADDING = 3;

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
          ? 'linear-gradient(to bottom, #1c1e42, #0e0f24)'
          : 'linear-gradient(to bottom, #8fcbf4, #5aa9ec)',
      }}
      className="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {/* stars — fade in for dark mode */}
      <span
        aria-hidden="true"
        style={{ left: 8, top: 6, width: 3, height: 3 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity duration-300 ${isDark ? 'opacity-90' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        style={{ left: 16, top: 16, width: 2, height: 2 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity delay-75 duration-300 ${isDark ? 'opacity-70' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        style={{ left: 24, top: 8, width: 2, height: 2 }}
        className={`pointer-events-none absolute rounded-full bg-white transition-opacity delay-150 duration-300 ${isDark ? 'opacity-60' : 'opacity-0'}`}
      />

      {/* cloud — fades in for light mode */}
      <span
        aria-hidden="true"
        style={{ right: 6, top: 8, width: 10, height: 5 }}
        className={`pointer-events-none absolute rounded-full bg-white/80 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* sliding knob */}
      <motion.span
        style={{ width: KNOB_SIZE, height: KNOB_SIZE }}
        className="relative z-10 flex items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
        animate={{ x: isDark ? TRACK_WIDTH - KNOB_SIZE - PADDING * 2 : 0 }}
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
              className="flex items-center justify-center text-[#1c1e42]"
            >
              <MoonIcon className="h-3.5 w-3.5" />
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
              <SunIcon className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
