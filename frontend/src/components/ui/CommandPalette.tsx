import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFocusTrap } from '@/hooks/useFocusTrap';

function highlight(text: string, query: string): string {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<mark class="bg-accent-subtle dark:bg-accent-subtle-dark text-accent rounded-sm px-0.5">${text.slice(idx, idx + query.length)}</mark>` +
    text.slice(idx + query.length)
  );
}

export function CommandPalette() {
  const { isOpen, query, actions, close, setQuery } = useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useFocusTrap(panelRef, isOpen);

  const filtered = actions.filter((action) => {
    const q = query.toLowerCase();
    return (
      action.label.toLowerCase().includes(q) ||
      (action.description?.toLowerCase().includes(q) ?? false)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => setActiveIndex(0), [query]);

  useKeyboardShortcuts({
    escape: close,
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[activeIndex]) {
        filtered[activeIndex].onSelect();
        close();
      }
    } else if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-ink/20 dark:bg-ink-dark/20 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="palette-panel"
            ref={panelRef}
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15vh] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark shadow-soft"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border dark:border-border-dark px-3 py-2">
              <svg className="h-4 w-4 shrink-0 text-ink-secondary dark:text-ink-dark-secondary" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
                placeholder="Search actions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-secondary dark:placeholder:text-ink-dark-secondary"
              />
              <kbd className="rounded-sm border border-border dark:border-border-dark px-1 py-0.5 font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
                Esc
              </kbd>
            </div>

            {/* Action list */}
            <ul
              role="listbox"
              aria-label="Actions"
              className="max-h-72 overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-ink-secondary dark:text-ink-dark-secondary">
                  No actions match "{query}"
                </li>
              )}
              {filtered.map((action, i) => (
                <li
                  key={action.id}
                  id={`cmd-${action.id}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => { action.onSelect(); close(); }}
                  className={[
                    'flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                    i === activeIndex
                      ? 'bg-canvas dark:bg-canvas-dark'
                      : '',
                  ].join(' ')}
                >
                  <div>
                    <p
                      className="font-medium"
                      dangerouslySetInnerHTML={{ __html: highlight(action.label, query) }}
                    />
                    {action.description && (
                      <p
                        className="text-xs text-ink-secondary dark:text-ink-dark-secondary"
                        dangerouslySetInnerHTML={{ __html: highlight(action.description, query) }}
                      />
                    )}
                  </div>
                  {action.shortcut && (
                    <kbd className="shrink-0 rounded-sm border border-border dark:border-border-dark px-1 py-0.5 font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">
                      {action.shortcut}
                    </kbd>
                  )}
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border dark:border-border-dark px-3 py-1.5 text-xs text-ink-secondary dark:text-ink-dark-secondary">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
