import { useEffect, useState, ReactNode } from "react";

/** localStorage-backed state */
export function useLocal<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV] as const;
}

export function H({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="display text-2xl font-bold deva">{title}</h2>
      {sub && <p className="mt-1 text-[15px] text-muted deva">{sub}</p>}
    </div>
  );
}

export function Wrap({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function StatTiles({ tiles, accent }: { tiles: { v: ReactNode; l: string }[]; accent: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t, i) => (
        <div key={i} className="card p-5">
          <div className="display text-2xl font-bold" style={{ color: accent }}>{t.v}</div>
          <div className="mt-1 text-xs text-muted deva">{t.l}</div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="text-xs text-faint">—</div>;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / span) * 26 - 2}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const uid = () => Math.floor(Math.random() * 1e9);
