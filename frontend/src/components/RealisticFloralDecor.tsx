import type { ReactNode } from 'react';

type FloralDensity = 'subtle' | 'balanced' | 'lush';
type FloralZone = 'hero' | 'content' | 'section';
type CardCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

const SUPPORTED_STYLE = 'green-pinocchio-white-roses';

const LAYER_PLACEMENTS: Record<FloralDensity, Record<FloralZone, string[]>> = {
  subtle: {
    hero: ['absolute -left-10 top-24 w-40 rotate-[-12deg]', 'absolute -right-12 bottom-24 w-44 rotate-[14deg]'],
    content: ['absolute -right-14 top-8 w-40 rotate-[12deg]'],
    section: ['absolute -left-12 top-10 w-40 rotate-[-16deg]'],
  },
  balanced: {
    hero: ['absolute -left-12 top-20 w-48 rotate-[-12deg]', 'absolute -right-14 bottom-20 w-52 rotate-[14deg]', 'absolute right-8 top-28 w-36 rotate-[26deg]'],
    content: ['absolute -right-14 top-4 w-44 rotate-[12deg]', 'absolute -left-16 top-[36%] w-48 rotate-[-18deg]'],
    section: ['absolute -left-14 top-8 w-44 rotate-[-16deg]', 'absolute -right-12 bottom-10 w-40 rotate-[18deg]'],
  },
  lush: {
    hero: ['absolute -left-16 top-14 w-56 rotate-[-14deg]', 'absolute -right-16 bottom-14 w-60 rotate-[15deg]', 'absolute right-6 top-24 w-44 rotate-[26deg]', 'absolute left-8 bottom-20 w-40 rotate-[-30deg]'],
    content: ['absolute -right-16 top-2 w-52 rotate-[12deg]', 'absolute -left-20 top-[28%] w-56 rotate-[-18deg]', 'absolute right-0 bottom-[18%] w-44 rotate-[22deg]'],
    section: ['absolute -left-16 top-6 w-52 rotate-[-16deg]', 'absolute -right-16 bottom-8 w-52 rotate-[18deg]', 'absolute right-[18%] top-8 w-36 rotate-[30deg]'],
  },
};

const CARD_CORNER_CLASS: Record<CardCorner, string> = {
  'top-right': '-right-8 -top-9 rotate-[18deg]',
  'top-left': '-left-8 -top-9 rotate-[-18deg] scale-x-[-1]',
  'bottom-right': '-right-9 -bottom-10 rotate-[145deg]',
  'bottom-left': '-left-9 -bottom-10 rotate-[-145deg] scale-x-[-1]',
};

export function normalizeFloralDensity(value: string | undefined): FloralDensity {
  return value === 'subtle' || value === 'lush' ? value : 'balanced';
}

export function normalizeFloralOpacity(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0.68;
  return Math.min(0.9, Math.max(0.25, value));
}

function isSupportedStyle(value: string | undefined): boolean {
  return (value ?? SUPPORTED_STYLE) === SUPPORTED_STYLE;
}

function RoseBloom({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="1" cy="2" rx="25" ry="22" fill="url(#roseShadow)" opacity="0.32" />
      <circle r="20" fill="url(#whiteRoseOuter)" stroke="rgba(63,86,49,0.15)" strokeWidth="1.2" />
      <path d="M-13 -2 C-13 -15 4 -19 13 -10 C23 1 13 18 -2 17 C-14 16 -20 7 -13 -2Z" fill="url(#whiteRosePetalA)" />
      <path d="M-5 -13 C9 -18 22 -6 15 8 C10 20 -8 18 -13 6 C-16 -2 -12 -10 -5 -13Z" fill="url(#whiteRosePetalB)" opacity="0.96" />
      <path d="M-9 4 C-4 -9 12 -8 14 3 C16 15 0 18 -8 11 C-11 9 -12 6 -9 4Z" fill="url(#whiteRosePetalC)" />
      <path d="M-2 -4 C6 -8 12 -1 8 7 C4 14 -8 10 -7 1 C-6 -2 -4 -3 -2 -4Z" fill="#FFFDF9" opacity="0.96" />
      <circle r="3.2" fill="url(#roseCenter)" opacity="0.82" />
    </g>
  );
}

function PinocchioStemCluster() {
  return (
    <g>
      <path d="M116 256 C103 198 94 139 60 48" stroke="url(#stemGradient)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M122 256 C132 190 150 112 190 28" stroke="url(#stemGradientLight)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M114 256 C121 180 120 108 112 38" stroke="url(#stemGradientDark)" strokeWidth="3.1" strokeLinecap="round" />
      <path d="M98 216 C72 194 52 166 34 128" stroke="url(#stemGradientLight)" strokeWidth="2.5" strokeLinecap="round" opacity="0.72" />
      <path d="M138 214 C168 182 188 148 205 108" stroke="url(#stemGradientLight)" strokeWidth="2.5" strokeLinecap="round" opacity="0.72" />

      {[
        [42, 130, -32, 24, 9],
        [69, 170, -24, 26, 9],
        [174, 123, 32, 25, 9],
        [151, 170, 26, 27, 9],
        [96, 204, -12, 23, 8],
        [130, 202, 15, 23, 8],
      ].map(([cx, cy, rotate, rx, ry]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#leafGradient)" opacity="0.72" transform={`rotate(${rotate} ${cx} ${cy})`} />
      ))}

      {[
        [62, 54, 6.4],
        [73, 80, 5.4],
        [84, 107, 6.2],
        [188, 40, 6.5],
        [176, 70, 5.4],
        [160, 100, 6.2],
        [110, 48, 5.4],
        [115, 78, 6.2],
        [118, 108, 5.4],
        [135, 136, 4.8],
        [92, 136, 4.8],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#pinocchioBud)" opacity="0.88" />
      ))}
    </g>
  );
}

export function RealisticFloralSpray({
  className = '',
  opacity = 0.68,
  children,
}: {
  className?: string;
  opacity?: number;
  children?: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 280"
      fill="none"
      aria-hidden="true"
      style={{
        opacity,
        filter: 'drop-shadow(0 16px 24px rgba(36,53,31,0.18))',
      }}
    >
      <defs>
        <filter id="floralTexture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
          <feBlend in="SourceGraphic" in2="monoNoise" mode="soft-light" />
        </filter>
        <linearGradient id="stemGradient" x1="60" y1="48" x2="116" y2="256">
          <stop offset="0%" stopColor="#9BB88D" />
          <stop offset="55%" stopColor="#507A4C" />
          <stop offset="100%" stopColor="#24422F" />
        </linearGradient>
        <linearGradient id="stemGradientLight" x1="190" y1="28" x2="122" y2="256">
          <stop offset="0%" stopColor="#C5D7BC" />
          <stop offset="52%" stopColor="#719A68" />
          <stop offset="100%" stopColor="#355942" />
        </linearGradient>
        <linearGradient id="stemGradientDark" x1="112" y1="38" x2="114" y2="256">
          <stop offset="0%" stopColor="#7FA173" />
          <stop offset="100%" stopColor="#203C2E" />
        </linearGradient>
        <radialGradient id="leafGradient" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D4E1CD" />
          <stop offset="50%" stopColor="#7FA173" />
          <stop offset="100%" stopColor="#426849" />
        </radialGradient>
        <radialGradient id="pinocchioBud" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#DDEBD6" />
          <stop offset="58%" stopColor="#719A68" />
          <stop offset="100%" stopColor="#355942" />
        </radialGradient>
        <radialGradient id="whiteRoseOuter" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="58%" stopColor="#F8F3EA" />
          <stop offset="100%" stopColor="#E0D6C8" />
        </radialGradient>
        <linearGradient id="whiteRosePetalA" x1="-17" y1="-16" x2="14" y2="18">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="62%" stopColor="#F5F0E7" />
          <stop offset="100%" stopColor="#DED2C2" />
        </linearGradient>
        <linearGradient id="whiteRosePetalB" x1="-9" y1="-18" x2="16" y2="18">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9DFD2" />
        </linearGradient>
        <linearGradient id="whiteRosePetalC" x1="-12" y1="-9" x2="14" y2="16">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#E6DBCD" />
        </linearGradient>
        <radialGradient id="roseCenter" cx="40%" cy="35%" r="68%">
          <stop offset="0%" stopColor="#F5D66D" />
          <stop offset="100%" stopColor="#AA812B" />
        </radialGradient>
        <radialGradient id="roseShadow" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9A8A78" />
          <stop offset="100%" stopColor="#3F562F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g filter="url(#floralTexture)">
        <PinocchioStemCluster />
        <RoseBloom x={66} y={72} scale={0.92} />
        <RoseBloom x={184} y={64} scale={0.86} />
        <RoseBloom x={112} y={108} scale={1} />
        <RoseBloom x={154} y={148} scale={0.72} />
        <RoseBloom x={82} y={148} scale={0.7} />
      </g>
      {children}
    </svg>
  );
}

export function FloralDecorLayer({
  enabled,
  styleKey,
  density,
  opacity,
  zone = 'content',
}: {
  enabled?: boolean;
  styleKey?: string;
  density?: string;
  opacity?: number;
  zone?: FloralZone;
}) {
  if (enabled === false || !isSupportedStyle(styleKey)) return null;
  const resolvedDensity = normalizeFloralDensity(density);
  const resolvedOpacity = normalizeFloralOpacity(opacity);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {LAYER_PLACEMENTS[resolvedDensity][zone].map((className, index) => (
        <RealisticFloralSpray key={`${zone}-${index}`} className={className} opacity={resolvedOpacity} />
      ))}
    </div>
  );
}

export function FloralCardAccent({
  enabled,
  styleKey,
  opacity,
  corner = 'top-right',
  className = '',
}: {
  enabled?: boolean;
  styleKey?: string;
  opacity?: number;
  corner?: CardCorner;
  className?: string;
}) {
  if (enabled === false || !isSupportedStyle(styleKey)) return null;
  return (
    <RealisticFloralSpray
      className={`absolute w-28 pointer-events-none ${CARD_CORNER_CLASS[corner]} ${className}`}
      opacity={Math.min(0.9, normalizeFloralOpacity(opacity) + 0.05)}
    />
  );
}
