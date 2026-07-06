interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-ink dark:fill-ink-dark" />
      <path
        d="M16 8L22.5 19.5H9.5L16 8Z"
        className="fill-canvas dark:fill-canvas-dark"
      />
      <circle cx="16" cy="22.5" r="1.6" className="fill-accent" />
    </svg>
  );
}
