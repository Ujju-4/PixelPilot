import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ImageAsset } from '@/types/image';

interface UndoState {
  stack: ImageAsset[];
  current: ImageAsset | null;
  canUndo: boolean;
  push: (asset: ImageAsset) => void;
  undo: () => void;
  reset: (initial?: ImageAsset) => void;
}

const UndoContext = createContext<UndoState | undefined>(undefined);

export function UndoProvider({ children, initial }: { children: ReactNode; initial?: ImageAsset }) {
  const [stack, setStack] = useState<ImageAsset[]>(initial ? [initial] : []);

  const push = useCallback((asset: ImageAsset) => {
    setStack((prev) => [...prev, asset]);
  }, []);

  const undo = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const reset = useCallback((newInitial?: ImageAsset) => {
    setStack(newInitial ? [newInitial] : []);
  }, []);

  const value = useMemo<UndoState>(
    () => ({
      stack,
      current: stack.length > 0 ? stack[stack.length - 1] : null,
      canUndo: stack.length > 1,
      push,
      undo,
      reset,
    }),
    [stack, push, undo, reset],
  );

  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}

export function useUndo(): UndoState {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndo must be used within UndoProvider');
  return ctx;
}
