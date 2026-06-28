import { useRef, useState } from "react";
import { LayoutDashboard, ShieldCheck, Siren, Phone, BookOpen, Send, ImagePlus, X, FileText, AlertTriangle } from "lucide-react";
import { AgentConsole, ConsoleModule } from "./AgentConsole";
import { Emergency } from "../Emergency";
import { H, Wrap } from "./kit";
import { useApp } from "../../app/AppContext";
import { callFeature, fileToInlineData } from "../../lib/api";
import { featureByKey } from "../../lib/features";
import { useVoice } from "../../hooks/useVoice";
import { Thinking, ListBlock, MockNote } from "../../components/ui";

const ACCENT = "#C0397B";

const riskTone = (level: string) =>
  level === "Emergency" ? { c: "#B23A2E", bg: "#F7E7E5" }
    : level === "High risk" ? { c: "#B23A2E", bg: "#F7E7E5" }
    : level === "Be cautious" ? { c: "#B07A1E", bg: "#F7EEDB" }
    : { c: "#2E6F52", bg: "#E4F1EA" };

// India women's-safety directory (tap-to-call)
const DIRECTORY: { name: string; number: string; note: string }[] = [
  { name: "National Emergency", number: "112", note: "Police · ambulance · fire — one number, 24×7 (112 India app has SOS)." },
  { name: "Women in Distress", number: "1091", note: "Dedicated women's emergency helpline." },
  { name: "Women Helpline", number: "181", note: "Support, counselling & guidance for women in distress." },
  { name: "Police", number: "100", note: "Local police control room." },
  { name: "Childline (minors)", number: "1098", note: "For anyone under 18 in danger or distress." },
  { name: "NCW WhatsApp", number: "7827170170", note: "National Commission for Women — report harassment (ncw.nic.in)." },
  { name: "Cyber Crime", number: "1930", note: "Online harassment, blackmail, image abuse — also cybercrime.gov.in." },
  { name: "Free Legal Aid (NALSA)", number: "15100", note: "Free legal help and advice." },
];

interface SafetyResult {
  summary: string;
  riskLevel: string;
  immediateSteps?: { step: string; detail?: string }[];
  helplines?: { name: string; number: string; why?: string }[];
  rights?: string[];
  safetyTips?: string[];
  disclaimer?: string;
  _mock?: boolean;
}

function HelpTool() {
  const { t, lang } = useApp();
  const meta = featureByKey("raahat");
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voice = useVoice(lang.speech, setText);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await fileToInlineData(file));
    setFileName(file.name);
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  }
  function clearFile() { setImage(null); setPreview(""); setFileName(""); if (fileRef.current) fileRef.current.value = ""; }

  async function run() {
    if (!text.trim() && !image) return;
    setLoading(true); setResult(null);
    try {
      setResult(await callFeature<SafetyResult>("raahat", { text, image, language: lang.name }));
    } catch { /* mock fallback */ } finally { setLoading(false); }
  }

  const tone = result ? riskTone(result.riskLevel) : null;

  return (
    <Wrap>
      <H title={t("rh.tag")} sub={t("rh.desc")} />

      <div className="card p-6">
        {preview && (
          <div className="relative mb-4 inline-block">
            <img src={preview} alt="evidence" className="max-h-44 rounded-2xl border border-line" />
            <button onClick={clearFile} className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"><X className="h-4 w-4" /></button>
          </div>
        )}
        {image && !preview && (
          <div className="relative mb-4 inline-flex items-center gap-2 rounded-2xl border border-line bg-mist px-4 py-3">
            <FileText className="h-5 w-5" style={{ color: ACCENT }} />
            <span className="max-w-[14rem] truncate text-sm font-medium text-graphite deva">{fileName || "Document"}</span>
            <button onClick={clearFile} className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("rh.ph")} rows={4} className="field resize-none deva" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || (!text.trim() && !image)} className="btn-accent text-[15px]" style={{ background: ACCENT }}><Send className="h-4 w-4" />{t("common.run")}</button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf" onChange={onFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm"><ImagePlus className="h-4 w-4" />{t("common.upload")} <span className="ml-1 text-faint">(photo / PDF)</span></button>
          {voice.supported && <button onClick={() => (voice.listening ? voice.stop() : voice.start(text))} className="btn-ghost text-sm">{voice.listening ? t("common.listening") : t("common.speak")}</button>}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F7E7E5] px-4 py-3 text-sm text-[#B23A2E]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <span className="deva">In immediate danger? Call <a href="tel:112" className="font-bold underline">112</a> or <a href="tel:1091" className="font-bold underline">1091</a> right now.</span>
        </div>
      </div>

      {loading && <div className="card mt-6 p-8"><Thinking label={t("common.running")} /></div>}

      {result && !loading && (
        <div className="mt-6 space-y-5">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="display text-lg font-semibold leading-snug text-ink deva">{result.summary}</p>
              {tone && <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: tone.bg, color: tone.c }}>{result.riskLevel}</span>}
            </div>
            {result._mock && <MockNote text={t("common.sample")} />}
          </div>

          {result.immediateSteps?.length ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted deva">{t("rh.steps")}</h3>
              <div className="space-y-2">
                {result.immediateSteps.map((s, i) => (
                  <div key={i} className="flex gap-3 rounded-2xl border border-line bg-paper p-4 deva">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: ACCENT }}>{i + 1}</span>
                    <div><div className="font-semibold text-ink">{s.step}</div>{s.detail && <p className="mt-0.5 text-sm text-muted">{s.detail}</p>}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.helplines?.length ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted deva">{t("rh.helplines")}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.helplines.map((h, i) => (
                  <a key={i} href={`tel:${h.number.replace(/[^\d]/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white" style={{ background: ACCENT }}><Phone className="h-5 w-5" /></span>
                    <div className="min-w-0"><div className="font-semibold text-ink deva">{h.name} · {h.number}</div>{h.why && <p className="truncate text-xs text-muted deva">{h.why}</p>}</div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {result.rights?.length ? <ListBlock title={t("rh.rights")} items={result.rights} accent={ACCENT} /> : null}
          {result.safetyTips?.length ? <ListBlock title={t("rh.tips")} items={result.safetyTips} tone="good" /> : null}

          {result.disclaimer && <p className="text-xs text-faint deva">{result.disclaimer}</p>}
        </div>
      )}
    </Wrap>
  );
}

export function RaahatConsole({ onBack }: { onBack: () => void }) {
  const { t } = useApp();

  const directory = (
    <Wrap>
      <H title={t("rh.directory")} sub="Tap to call. Save the key ones to your phone's emergency contacts." />
      <div className="grid gap-2 sm:grid-cols-2">
        {DIRECTORY.map((d) => (
          <a key={d.number} href={`tel:${d.number.replace(/[^\d]/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl text-white" style={{ background: ACCENT }}><Phone className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="font-semibold text-ink">{d.name} · <span style={{ color: ACCENT }}>{d.number}</span></div>
              <p className="text-xs text-muted">{d.note}</p>
            </div>
          </a>
        ))}
      </div>
    </Wrap>
  );

  const dashboard = (go: (id: string) => void) => (
    <Wrap>
      <H title="Nirbhaya — women's safety" sub="Describe any unsafe situation and get calm, India-specific steps, the right helplines and your rights." />
      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={() => go("help")} className="card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-float">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: ACCENT }}><ShieldCheck className="h-5 w-5" /></span>
          <div className="mt-3 display text-lg font-bold deva">{t("rh.tag")}</div>
          <p className="mt-1 text-sm text-muted deva">Tell Nirbhaya what's happening — get steps, helplines and your rights.</p>
        </button>
        <button onClick={() => go("directory")} className="card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-float">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: ACCENT }}><Phone className="h-5 w-5" /></span>
          <div className="mt-3 display text-lg font-bold deva">{t("rh.directory")}</div>
          <p className="mt-1 text-sm text-muted deva">112, 1091, 181 and more — tap to call.</p>
        </button>
      </div>
    </Wrap>
  );

  const modules: ConsoleModule[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, render: (go) => dashboard(go) },
    { id: "help", label: t("rh.tag"), icon: ShieldCheck, render: () => <HelpTool /> },
    { id: "directory", label: t("rh.helplines"), icon: BookOpen, render: () => directory },
    { id: "sos", label: "Already affected?", icon: Siren, render: () => <Emergency agentKey="raahat" /> },
  ];
  return <AgentConsole agentKey="raahat" platform={t("rh.tag")} badge={ShieldCheck} modules={modules} onBack={onBack} />;
}
