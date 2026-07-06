import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { SpinnerIcon } from '@/components/icons/UploadIcons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent hover:bg-accent-hover text-white border-transparent shadow-sm',
  secondary:
    'bg-surface dark:bg-surface-dark hover:bg-canvas dark:hover:bg-canvas-dark text-ink dark:text-ink-dark border-border/60 dark:border-border-dark/60',
  ghost:
    'bg-transparent hover:bg-canvas dark:hover:bg-canvas-dark text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark border-transparent',
  danger:
    'bg-danger hover:opacity-90 text-white border-transparent shadow-sm',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-xl border font-medium transition-all duration-150 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <SpinnerIcon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
