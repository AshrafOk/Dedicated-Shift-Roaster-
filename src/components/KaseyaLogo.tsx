import React from 'react';

interface KaseyaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const KaseyaLogo: React.FC<KaseyaLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  // Dimensions
  const emblemSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Kaseya Diamond "K" Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${emblemSize} shrink-0 drop-shadow-xs`}
        aria-label="Kaseya logo icon"
      >
        {/* Curved dynamic blue diamond / parallelogram */}
        <path
          d="M 52 4 C 74 6, 94 22, 98 42 C 100 52, 96 66, 88 78 C 76 96, 56 98, 42 98 C 22 96, 6 82, 2 64 C -2 50, 4 34, 14 20 C 26 6, 40 2, 52 4 Z"
          fill="#0072CE"
        />
        {/* Stylized sharp white K paths matching authentic logo */}
        {/* Left vertical/angled stem */}
        <path
          d="M 28 80 L 42 16 L 54 18 L 39 80 Z"
          fill="#FFFFFF"
        />
        {/* Upper diagonal arm */}
        <path
          d="M 39 48 L 74 16 L 86 20 L 48 54 Z"
          fill="#FFFFFF"
        />
        {/* Lower diagonal leg */}
        <path
          d="M 44 49 L 75 78 L 62 82 L 35 56 Z"
          fill="#FFFFFF"
        />
      </svg>

      {/* Wordmark: Kaseya with Registered Symbol */}
      {showWordmark && (
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight text-slate-900 font-sans ${textClass}`}>
            Kaseya
          </span>
          <span className="text-[10px] font-bold text-slate-700 ml-0.5 relative -top-2">
            ®
          </span>
        </div>
      )}
    </div>
  );
};
