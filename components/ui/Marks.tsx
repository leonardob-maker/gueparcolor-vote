/**
 * Marcas gráficas desenhadas em SVG inline.
 * Não dependem de nenhum asset, então trocar a paleta em globals.css
 * repagina todas de uma vez.
 */

export function SprayArc({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 120"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M8 92C96 34 214 12 334 24c62 6 118 26 178 62"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M52 112c78-40 168-58 262-50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function NumberTag({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-display text-3xl leading-none ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 20 10 8M12 18 16 4M20 16l1-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {value}
    </span>
  );
}

export function Splatter({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="currentColor">
      <circle cx="100" cy="100" r="62" />
      <circle cx="168" cy="62" r="13" />
      <circle cx="42" cy="152" r="9" />
      <circle cx="158" cy="148" r="7" />
      <circle cx="36" cy="58" r="16" />
      <circle cx="104" cy="186" r="6" />
    </svg>
  );
}

export function CheckMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="m4 13 5.5 5.5L20 5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
