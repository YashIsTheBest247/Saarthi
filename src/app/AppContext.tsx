import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { DEFAULT_LANGUAGE, Language } from "../lib/languages";
import { makeT, TFn } from "../lib/i18n";
import { getHealth, Health } from "../lib/api";

interface AppCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: TFn;
  health: Health;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [health, setHealth] = useState<Health>({ ok: true, live: false, model: "…" });

  useEffect(() => {
    getHealth().then(setHealth);
  }, []);

  const t = useMemo(() => makeT(lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, health }), [lang, t, health]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
