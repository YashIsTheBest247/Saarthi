/**
 * Saarthi brand mark — an orchestration constellation: one coordinator node
 * (Saarthi) linked to its satellite agents. Self-contained rounded tile.
 */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  const sat = [
    { x: 32, y: 16 },
    { x: 17.8, y: 40 },
    { x: 46.2, y: 40 },
  ];
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Saarthi">
      <defs>
        <linearGradient id="sa-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A251D" />
          <stop offset="1" stopColor="#0E0C09" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#sa-tile)" />
      {/* faint orbit */}
      <circle cx="32" cy="32" r="16" fill="none" stroke="#EDE8DF" strokeOpacity="0.12" strokeWidth="1.5" />
      {/* connectors */}
      {sat.map((s, i) => (
        <line key={i} x1="32" y1="32" x2={s.x} y2={s.y} stroke="#EDE8DF" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {/* satellite agent nodes */}
      {sat.map((s, i) => (
        <circle key={`n${i}`} cx={s.x} cy={s.y} r="3.4" fill="#EDE8DF" />
      ))}
      {/* coordinator halo + hub */}
      <circle cx="32" cy="32" r="9.5" fill="none" stroke="#C77A45" strokeOpacity="0.35" strokeWidth="1.4" />
      <circle cx="32" cy="32" r="6" fill="#C77A45" />
    </svg>
  );
}
