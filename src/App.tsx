import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "./app/AppContext";
import { Nav } from "./components/Nav";
import { Landing } from "./components/Landing";
import { KavachConsole } from "./features/kavach/KavachConsole";
import { SehatConsole } from "./features/sehat/SehatConsole";
import { SamajhConsole } from "./features/console/SamajhConsole";
import { HaqConsole } from "./features/console/HaqConsole";
import { PaisaConsole } from "./features/console/PaisaConsole";
import { SamayConsole } from "./features/console/SamayConsole";
import { SetuConsole } from "./features/console/SetuConsole";
import { KrishiConsole } from "./features/console/KrishiConsole";
import { KarConsole } from "./features/console/KarConsole";
import { RaahatConsole } from "./features/console/RaahatConsole";
import { FloatingChat } from "./components/FloatingChat";
import { FeatureKey } from "./lib/api";

type View = "home" | FeatureKey;

function Shell() {
  const { lang } = useApp();
  const [view, setView] = useState<View>("home");
  const L = lang.iso; // include in keys so a language switch cross-fades smoothly

  // scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  // deep links (e.g. from the Telegram bot): ?agent=kavach opens that console,
  // ?q=... opens the chat pre-filled. URL is cleaned afterwards.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const a = p.get("agent");
    const q = p.get("q");
    const valid = ["kavach", "samajh", "haq", "sehat", "paisa", "samay", "setu", "krishi", "kar", "raahat"];
    if (a && valid.includes(a)) setView(a as FeatureKey);
    else if (q) window.dispatchEvent(new CustomEvent("saarthi:openchat", { detail: { q } }));
    if (a || q) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const open = (k?: FeatureKey) => setView(k ?? "kavach");
  const back = () => setView("home");

  return (
    <div className="page-bg relative min-h-screen">
      {view === "home" && <Nav onHome={() => setView("home")} onOpen={open} />}

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {view === "home" && <Landing key={`home-${L}`} onOpen={open} />}
          {view === "kavach" && <KavachConsole key={`kavach-${L}`} onBack={back} />}
          {view === "samajh" && <SamajhConsole key={`samajh-${L}`} onBack={back} />}
          {view === "haq" && <HaqConsole key={`haq-${L}`} onBack={back} />}
          {view === "sehat" && <SehatConsole key={`sehat-${L}`} onBack={back} />}
          {view === "paisa" && <PaisaConsole key={`paisa-${L}`} onBack={back} />}
          {view === "samay" && <SamayConsole key={`samay-${L}`} onBack={back} />}
          {view === "setu" && <SetuConsole key={`setu-${L}`} onBack={back} />}
          {view === "krishi" && <KrishiConsole key={`krishi-${L}`} onBack={back} />}
          {view === "kar" && <KarConsole key={`kar-${L}`} onBack={back} />}
          {view === "raahat" && <RaahatConsole key={`raahat-${L}`} onBack={back} />}
        </AnimatePresence>
      </main>

      <FloatingChat onOpen={open} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
