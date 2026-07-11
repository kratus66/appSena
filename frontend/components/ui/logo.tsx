import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Tamaño del cuadro del símbolo en px. */
  size?: number;
  /** Muestra el wordmark "AppSena" al lado del símbolo. */
  withWordmark?: boolean;
  className?: string;
  /** Usa colores claros (para fondos oscuros como el sidebar). */
  light?: boolean;
}

/** Símbolo de marca AppSena: birrete de graduación sobre el verde SENA. */
export function LogoMark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <span
      className="inline-grid place-items-center rounded-xl shadow-sm shrink-0"
      style={{
        width: size,
        height: size,
        background: light ? 'rgba(255,255,255,0.12)' : '#39A900',
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
        <path d="M22 10v5" />
      </svg>
    </span>
  );
}

export function Logo({ size = 40, withWordmark = true, className, light = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark size={size} light={light} />
      {withWordmark && (
        <span
          className={cn(
            'text-xl font-bold tracking-tight',
            light ? 'text-white' : 'text-gray-900'
          )}
        >
          AppSena
        </span>
      )}
    </span>
  );
}
