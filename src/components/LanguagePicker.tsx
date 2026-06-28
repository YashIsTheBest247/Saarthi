import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Check, ChevronDown } from "lucide-react";
import { LANGUAGES } from "../lib/languages";
import { useApp } from "../app/AppContext";

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`btn border border-line bg-paper text-graphite hover:border-[#2D6BFF] ${
          compact ? "px-3 py-2 text-sm" : "px-4 py-2.5"
        }`}
      >
        <Languages className="h-4 w-4" />
        <span className="deva">{lang.native}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-float"
          >
            <div className="max-h-80 overflow-y-auto">
              {LANGUAGES.map((l) => {
                const active = l.iso === lang.iso;
                return (
                  <button
                    key={l.iso}
                    onClick={() => {
                      setLang(l);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-[#E8F0FF] text-[#1A49BD]" : "hover:bg-mist text-graphite"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="deva text-[15px] font-medium">{l.native}</span>
                      <span className="text-xs text-faint">{l.name}</span>
                    </span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
