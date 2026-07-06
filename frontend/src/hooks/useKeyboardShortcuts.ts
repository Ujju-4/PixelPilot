import { useEffect } from 'react';

interface ShortcutMap {
  'mod+k'?: () => void;
  'mod+z'?: () => void;
  escape?: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      // Skip when user is typing in an input unless it's a modifier combo.
      const target = event.target as HTMLElement;
      const isInField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isMod && key === 'k') {
        event.preventDefault();
        shortcuts['mod+k']?.();
        return;
      }

      if (isMod && key === 'z') {
        event.preventDefault();
        shortcuts['mod+z']?.();
        return;
      }

      if (key === 'escape' && !isInField) {
        shortcuts['escape']?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
