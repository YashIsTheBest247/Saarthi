import { useState } from "react";
import { Send, Megaphone } from "lucide-react";
import { useApp } from "../app/AppContext";
import { featureByKey } from "../lib/features";
import { callFeature } from "../lib/api";
import { useVoice } from "../hooks/useVoice";
import { FeatureShell } from "../components/FeatureShell";
import { Thinking, VoiceButton, ListBlock, ResultCard, MockNote, CopyBlock } from "../components/ui";

interface VyapaarResult {
  title: string;
  content: string;
  variations?: string[];
  hashtags?: string[];
  tips?: string[];
  _mock?: boolean;
}

const KINDS = ["WhatsApp message", "Festival offer", "Product description", "Social media caption", "Price list"];
const TONES = ["Friendly", "Festive", "Premium", "Urgent / sale", "Simple"];

export function Vyapaar({ onBack }: { onBack: () => void }) {
  const meta = featureByKey("vyapaar");
  const { t, lang } = useApp();
  const [goal, setGoal] = useState("");
  const [business, setBusiness] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VyapaarResult | null>(null);
  const voice = useVoice(lang.speech, setGoal);

  async function run() {
    if (!goal.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await callFeature<VyapaarResult>("vyapaar", { goal, business, kind, tone, language: lang.name }));
    } catch {
      /* mock fallback */
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeatureShell meta={meta} onBack={onBack}>
      <div className="card p-6 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-graphite deva">{t("v.kind")}</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="field">
              {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-graphite deva">{t("v.tone")}</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="field">
              {TONES.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        </div>

        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={t("v.business")} className="field mt-3 deva" />

        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={t("v.ph")}
          rows={3}
          className="field mt-3 resize-none deva"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || !goal.trim()} className="btn-accent text-[15px]">
            <Send className="h-4 w-4" />
            {t("common.run")}
          </button>
          {voice.supported && (
            <VoiceButton
              listening={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(goal))}
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
            <span className="pill" style={{ color: meta.accent }}><Megaphone className="h-3.5 w-3.5" /> {result.title}</span>
            <div className="mt-4">
              <CopyBlock text={result.content} />
            </div>

            {result.variations?.length ? (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("gen.variations")}</h4>
                <div className="space-y-3">
                  {result.variations.map((v, i) => <CopyBlock key={i} text={v} />)}
                </div>
              </div>
            ) : null}

            {result.hashtags?.length ? (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{t("gen.tags")}</h4>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((h, i) => <span key={i} className="pill">{h}</span>)}
                </div>
              </div>
            ) : null}

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
