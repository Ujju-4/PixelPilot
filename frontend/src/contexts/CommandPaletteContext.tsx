import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface PaletteAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: string;
  onSelect: () => void;
}

interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  actions: PaletteAction[];
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  registerActions: (newActions: PaletteAction[]) => void;
  clearActions: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteState | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState<PaletteAction[]>([]);

  const open = useCallback(() => {
    setQuery('');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const registerActions = useCallback((newActions: PaletteAction[]) => {
    setActions((prev) => {
      const existingIds = new Set(newActions.map((a) => a.id));
      return [...prev.filter((a) => !existingIds.has(a.id)), ...newActions];
    });
  }, []);

  const clearActions = useCallback(() => setActions([]), []);

  const value = useMemo<CommandPaletteState>(
    () => ({ isOpen, query, actions, open, close, setQuery, registerActions, clearActions }),
    [isOpen, query, actions, open, close, setQuery, registerActions, clearActions],
  );

  return (
    <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteState {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return ctx;
}
