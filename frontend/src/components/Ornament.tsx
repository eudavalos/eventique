interface OrnamentProps {
  className?: string;
  color?: string;
  size?: number;
}

export function OrnamentDivider({ className = '', color = 'var(--color-accent)' }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
      <div className="ornament-line flex-1 max-w-24" />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L13.5 8.5L20 8L14.5 12L17 18.5L12 14.5L7 18.5L9.5 12L4 8L10.5 8.5L12 2Z"
          fill={color}
          opacity="0.8"
        />
      </svg>
      <div className="ornament-line flex-1 max-w-24" />
    </div>
  );
}

export function OrnamentLeaf({ className = '', color = 'var(--color-primary)', size = 48 }: OrnamentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M24 4C24 4 8 14 8 26C8 34.837 15.163 42 24 42C32.837 42 40 34.837 40 26C40 14 24 4 24 4Z"
        fill={color}
        opacity="0.15"
      />
      <path
        d="M24 4C24 4 8 14 8 26C8 34.837 15.163 42 24 42"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path d="M24 42V8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M24 18L16 13M24 26L32 20M24 34L17 30" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function OrnamentBranch({ className = '', color = 'var(--color-primary)', size = 80 }: OrnamentProps) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 80 40" fill="none" className={className} aria-hidden>
      <path d="M4 20C4 20 20 10 40 20C60 30 76 20 76 20" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M20 20C20 20 22 12 28 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M40 20C40 20 38 12 34 6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M60 20C60 20 62 12 66 9" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <circle cx="28" cy="8" r="2" fill={color} opacity="0.3" />
      <circle cx="34" cy="6" r="2" fill={color} opacity="0.3" />
      <circle cx="66" cy="9" r="2" fill={color} opacity="0.3" />
    </svg>
  );
}

export function OrnamentRings({ className = '', color = 'var(--color-accent)', size = 40 }: OrnamentProps) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 64 40" fill="none" className={className} aria-hidden>
      <circle cx="22" cy="20" r="16" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="42" cy="20" r="16" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}

export function OrnamentFloral({ className = '', color = 'var(--color-primary)', size = 64 }: OrnamentProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx={32 + 14 * Math.cos((angle * Math.PI) / 180)}
          cy={32 + 14 * Math.sin((angle * Math.PI) / 180)}
          rx="6"
          ry="10"
          fill={color}
          opacity="0.12"
          transform={`rotate(${angle} ${32 + 14 * Math.cos((angle * Math.PI) / 180)} ${32 + 14 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="32" cy="32" r="6" fill={color} opacity="0.25" />
    </svg>
  );
}
