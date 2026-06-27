import { useState } from "react";
import { Send, Briefcase, FileText, Mail, Search } from "lucide-react";
import { useApp } from "../app/AppContext";
import { featureByKey } from "../lib/features";
import { callFeature } from "../lib/api";
import { useVoice } from "../hooks/useVoice";
import { FeatureShell } from "../components/FeatureShell";
import { Thinking, VoiceButton, ListBlock, ResultCard, MockNote, CopyBlock } from "../components/ui";

interface NaukriResult {
  title: string;
  summary: string;
  output: string;
  highlights?: string[];
  whereToLook?: string[];
  tips?: string[];
  _mock?: boolean;
}

export function Naukri({ onBack }: { onBack: () => void }) {
  const meta = featureByKey("naukri");
  const { t, lang } = useApp();
  const [mode, setMode] = useState<"resume" | "application" | "find">("resume");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NaukriResult | null>(null);
  const voice = useVoice(lang.speech, setDetails);

  const MODES = [
    { id: "resume", label: t("n.modeResume"), icon: FileText },
    { id: "application", label: t("n.modeApply"), icon: Mail },
    { id: "find", label: t("n.modeFind"), icon: Search },
  ] as const;

  async function run() {
    if (!details.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await callFeature<NaukriResult>("naukri", { mode, details, language: lang.name }));
    } catch {
      /* mock fallback */
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeatureShell meta={meta} onBack={onBack}>
      <div className="card p-6 sm:p-7">
        <div className="mb-4 inline-flex flex-wrap gap-1 rounded-full border border-line bg-mist p-1">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`btn px-4 py-2 text-sm ${mode === id ? "text-white" : "text-graphite"}`}
              style={mode === id ? { background: meta.accent } : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={t("n.ph")}
          rows={4}
          className="field resize-none deva"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || !details.trim()} className="btn-accent text-[15px]">
            <Send className="h-4 w-4" />
            {t("common.run")}
          </button>
          {voice.supported && (
            <VoiceButton
              listening={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(details))}
              speakLabel={t("common.speak")}
              listeningLabel={t("common.listening")}
            />
          )}
        </div>
      </div>

      {loading && <div className="card mt-6 p-8"><Thinking label={t("common.running")} /></div>}

      {result && !loading && (
        <div className="mt-6">
          <ResultCard accent={meta.accent}>
            <span className="pill" style={{ color: meta.accent }}><Briefcase className="h-3.5 w-3.5" /> {result.title}</span>
            <p className="display mt-3 text-lg font-semibold leading-snug deva">{result.summary}</p>
            <div className="mt-4">
              <CopyBlock text={result.output} />
            </div>

            <div className="mt-6 grid gap-7 sm:grid-cols-2 deva">
              {result.highlights?.length ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t("gen.highlights")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((h, i) => <span key={i} className="pill">{h}</span>)}
                  </div>
                </div>
              ) : null}
              <ListBlock title={t("gen.where")} items={result.whereToLook || []} accent={meta.accent} />
            </div>

            {result.tips?.length ? (
              <div className="mt-6 deva"><ListBlock title={t("gen.tips")} items={result.tips} tone="good" /></div>
            ) : null}

            {result._mock && <MockNote text={t("common.sample")} />}
          </ResultCard>
        </div>
      )}
    </FeatureShell>
  );
}
