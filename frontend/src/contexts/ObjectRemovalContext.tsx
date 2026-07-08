import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

interface ObjectRemovalContextValue {
  /** The hidden mask canvas — white strokes on black, sent to the API */
  maskCanvasRef: RefObject<HTMLCanvasElement | null>;
  /** Whether the user has painted anything yet */
  hasPaint: boolean;
  setHasPaint: (v: boolean) => void;
  /** Incrementing this tells the canvas to wipe itself */
  clearTrigger: number;
  triggerClear: () => void;
}

const Ctx = createContext<ObjectRemovalContextValue | null>(null);

export function ObjectRemovalProvider({ children }: { children: ReactNode }) {
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPaint, setHasPaint] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  const triggerClear = useCallback(() => {
    setHasPaint(false);
    setClearTrigger((n) => n + 1);
  }, []);

  return (
    <Ctx.Provider value={{ maskCanvasRef, hasPaint, setHasPaint, clearTrigger, triggerClear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useObjectRemoval() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useObjectRemoval must be inside ObjectRemovalProvider');
  return ctx;
}
