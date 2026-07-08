import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { SpinnerIcon } from '@/components/icons/UploadIcons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

type ButtonProps =
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string });

// Each variant is a genuinely different surface, not a recolored rectangle:
// primary = solid fill (the one obvious action on a panel), secondary = outline
// only, ghost = text only, danger = solid fill in the danger hue. Size controls
// the radius too, so every button in the app reads as the same family of shape.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent text-white border-transparent shadow-sm hover:bg-accent-hover active:bg-accent-hover',
  secondary:
    'bg-transparent text-ink dark:text-ink-dark border-border dark:border-border-dark hover:border-ink-tertiary dark:hover:border-ink-dark-tertiary hover:bg-black/[0.02] dark:hover:bg-white/[0.03]',
  ghost:
    'bg-transparent text-ink-secondary dark:text-ink-dark-secondary border-transparent hover:text-ink dark:hover:text-ink-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
  danger:
    'bg-danger text-white border-transparent shadow-sm hover:opacity-90',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-7 rounded px-2.5 text-xs gap-1.5',
  md: 'h-9 rounded-lg px-3.5 text-[13px] gap-1.5',
};

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    ...rest
  } = props;

  const classes = [
    'inline-flex items-center justify-center border font-medium transition-colors duration-150 select-none',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ');

  const leading = loading ? (
    <SpinnerIcon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
  ) : icon ? (
    <span className="shrink-0">{icon}</span>
  ) : null;

  if (typeof props.href === 'string') {
    const { href, ...anchorRest } = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };
    return (
      <a href={href} className={classes} {...anchorRest}>
        {leading}
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  const isDisabled = buttonRest.disabled || loading;

  return (
    <button type="button" disabled={isDisabled} className={classes} {...buttonRest}>
      {leading}
      {children}
    </button>
  );
}
