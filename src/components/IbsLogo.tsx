import React from 'react';

interface IbsLogoProps {
  className?: string;
  size?: number | string;
  withText?: boolean;
}

export const IbsLogo: React.FC<IbsLogoProps> = ({
  className = '',
  size = 64,
  withText = false,
}) => {
  return (
    <div className={`relative inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D Isometric Cyber-Brain & Hand Avatar SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-2xl shadow-xl shadow-slate-900/30 ring-1 ring-slate-700/50 hover:scale-105 transition-transform duration-300"
      >
        <defs>
          {/* Background Dark Gradient */}
          <radialGradient id="ibsBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#22252a" />
            <stop offset="100%" stopColor="#0d0e11" />
          </radialGradient>

          {/* Isometric Cube Grid Shadows */}
          <linearGradient id="cubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a2e35" />
            <stop offset="100%" stopColor="#1e2126" />
          </linearGradient>
          <linearGradient id="cubeLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#181a1f" />
            <stop offset="100%" stopColor="#101115" />
          </linearGradient>
          <linearGradient id="cubeRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f2228" />
            <stop offset="100%" stopColor="#131519" />
          </linearGradient>

          {/* Poly Gradients */}
          <linearGradient id="polyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="polyCoral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="polyCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="polyTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Background Container */}
        <rect width="200" height="200" rx="28" fill="url(#ibsBg)" />

        {/* 3D Geometric Blocks Motif in background */}
        <g opacity="0.45">
          {/* Row 1 */}
          <rect x="8" y="8" width="42" height="42" rx="4" fill="url(#cubeTop)" />
          <rect x="54" y="8" width="42" height="42" rx="4" fill="url(#cubeLeft)" />
          <rect x="100" y="8" width="42" height="42" rx="4" fill="url(#cubeTop)" />
          <rect x="146" y="8" width="46" height="42" rx="4" fill="url(#cubeRight)" />

          {/* Row 2 */}
          <rect x="8" y="54" width="42" height="42" rx="4" fill="url(#cubeLeft)" />
          <rect x="146" y="54" width="46" height="42" rx="4" fill="url(#cubeLeft)" />

          {/* Row 3 */}
          <rect x="8" y="100" width="42" height="42" rx="4" fill="url(#cubeRight)" />
          <rect x="146" y="100" width="46" height="42" rx="4" fill="url(#cubeTop)" />

          {/* Row 4 */}
          <rect x="8" y="146" width="42" height="46" rx="4" fill="url(#cubeTop)" />
          <rect x="54" y="146" width="42" height="46" rx="4" fill="url(#cubeRight)" />
          <rect x="100" y="146" width="42" height="46" rx="4" fill="url(#cubeLeft)" />
          <rect x="146" y="146" width="46" height="46" rx="4" fill="url(#cubeTop)" />
        </g>

        {/* Low-Poly Futuristic Hand / Brain Neural Structure */}
        <g transform="translate(10, 8)">
          {/* Constellation wireframe nodes & lines */}
          <g stroke="#ffffff" strokeWidth="0.8" opacity="0.75">
            <line x1="110" y1="36" x2="132" y2="48" />
            <line x1="132" y1="48" x2="148" y2="68" />
            <line x1="148" y1="68" x2="144" y2="92" />
            <line x1="144" y1="92" x2="124" y2="108" />
            <line x1="132" y1="48" x2="118" y2="72" />
            <line x1="110" y1="36" x2="88" y2="40" />
            <line x1="148" y1="68" x2="128" y2="82" />
            <line x1="102" y1="24" x2="132" y2="48" />
          </g>

          {/* Polygonal Hand Facets */}
          {/* Finger 1 (Yellow / Orange gradient) */}
          <polygon points="56,88 68,64 82,54 74,78" fill="url(#polyYellow)" />
          <polygon points="68,64 82,54 94,48 84,68" fill="#FDE047" />
          <polygon points="84,68 94,48 106,46 98,68" fill="#FBBF24" />
          <polygon points="56,88 74,78 70,96 52,102" fill="#F97316" />

          {/* Finger 2 (Orange / Coral / Rose) */}
          <polygon points="74,78 84,68 98,68 88,86" fill="#EA580C" />
          <polygon points="88,86 98,68 112,68 102,88" fill="url(#polyCoral)" />
          <polygon points="70,96 74,78 88,86 80,104" fill="#E11D48" />
          <polygon points="80,104 88,86 102,88 94,108" fill="#BE123C" />

          {/* Finger 3 (Teal / Cyan / Blue) */}
          <polygon points="98,68 106,46 122,50 114,70" fill="url(#polyTeal)" />
          <polygon points="114,70 122,50 134,58 126,78" fill="#38BDF8" />
          <polygon points="102,88 112,68 126,78 116,98" fill="url(#polyCyan)" />
          <polygon points="116,98 126,78 138,88 126,108" fill="#0284C7" />
          <polygon points="94,108 102,88 116,98 106,116" fill="#0369A1" />

          {/* Constellation Dots */}
          <circle cx="102" cy="24" r="2.5" fill="#ffffff" filter="url(#glow)" />
          <circle cx="110" cy="36" r="2.5" fill="#ffffff" />
          <circle cx="132" cy="48" r="2.5" fill="#ffffff" />
          <circle cx="148" cy="68" r="2.5" fill="#ffffff" />
          <circle cx="144" cy="92" r="2.5" fill="#ffffff" />
          <circle cx="124" cy="108" r="2.5" fill="#ffffff" />
          <circle cx="88" cy="40" r="2" fill="#ffffff" />
        </g>

        {/* Bold White Brand Lettering: "ИБС" */}
        <g filter="url(#glow)">
          <text
            x="100"
            y="142"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="54"
            letterSpacing="-1"
          >
            ИБС
          </text>
        </g>

        {/* Subtitle: "ИНТЕЛЛЕКТУАЛЬНЫЕ БИЗНЕС СИСТЕМЫ" */}
        <text
          x="100"
          y="172"
          textAnchor="middle"
          fill="#E2E8F0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="7.5"
          letterSpacing="2.2"
        >
          ИНТЕЛЛЕКТУАЛЬНЫЕ БИЗНЕС СИСТЕМЫ
        </text>
      </svg>

      {withText && (
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
            Интеллектуальные Бизнес Системы
          </span>
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            ИТ-решения и САПР нового поколения
          </span>
        </div>
      )}
    </div>
  );
};
