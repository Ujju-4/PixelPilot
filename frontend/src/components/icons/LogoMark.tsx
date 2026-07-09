interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="fill-accent">
        <path d="M34 32 L24 9 L44 15 Z" />
      </g>
      <g className="fill-accent-gradient-to">
        <path d="M34 32 L24 9 L44 15 Z" transform="rotate(60 32 32)" />
      </g>
      <g className="fill-accent">
        <path d="M34 32 L24 9 L44 15 Z" transform="rotate(120 32 32)" />
      </g>
      <g className="fill-accent-gradient-to">
        <path d="M34 32 L24 9 L44 15 Z" transform="rotate(180 32 32)" />
      </g>
      <g className="fill-accent">
        <path d="M34 32 L24 9 L44 15 Z" transform="rotate(240 32 32)" />
      </g>
      <g className="fill-accent-gradient-to">
        <path d="M34 32 L24 9 L44 15 Z" transform="rotate(300 32 32)" />
      </g>
      <rect
        x="29"
        y="29"
        width="6"
        height="6"
        rx="1"
        className="fill-canvas dark:fill-canvas-dark"
      />
    </svg>
  );
}
