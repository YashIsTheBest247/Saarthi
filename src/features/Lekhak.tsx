import { useState } from "react";
import { Send, FileText } from "lucide-react";
import { useApp } from "../app/AppContext";
import { featureByKey } from "../lib/features";
import { callFeature } from "../lib/api";
import { useVoice } from "../hooks/useVoice";
import { FeatureShell } from "../components/FeatureShell";
import { Thinking, VoiceButton, ListBlock, ResultCard, MockNote, CopyBlock } from "../components/ui";

interface LekhakResult {
  title: string;
  to?: string;
  subject: string;
  letter: string;
  attachments?: string[];
  tips?: string[];
  _mock?: boolean;
}

const TYPES = [
  "Complaint letter", "RTI application", "Leave application", "Job application", "Resignation letter",
  "Bank letter", "Landlord / rent letter", "School / college application", "Government department letter", "General letter",
];

export function Lekhak({ onBack }: { onBack: () => void }) {
  const meta = featureByKey("lekhak");
  const { t, lang } = useApp();
  const [need, setNeed] = useState("");
  const [letterType, setLetterType] = useState(TYPES[0]);
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LekhakResult | null>(null);
  const voice = useVoice(lang.speech, setNeed);

  async function run() {
    if (!need.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await callFeature<LekhakResult>("lekhak", { need, letterType, recipient, details, language: lang.name }));
    } catch {
      /* mock fallback */
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeatureShell meta={meta} onBack={onBack}>
      <div className="card p-6 sm:p-7">
        <label className="mb-1.5 block text-sm font-medium text-graphite deva">{t("l.type")}</label>
        <select value={letterType} onChange={(e) => setLetterType(e.target.value)} className="field mb-4">
          {TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
        </select>

        <textarea
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          placeholder={t("l.ph")}
          rows={3}
          className="field resize-none deva"
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={t("l.recipient")} className="field deva" />
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t("l.details")} className="field deva" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || !need.trim()} className="btn-accent text-[15px]">
            <Send className="h-4 w-4" />
            {t("common.run")}
          </button>
          {voice.supported && (
            <VoiceButton
              listening={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(need))}
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
            <span className="pill" style={{ color: meta.accent }}><FileText className="h-3.5 w-3.5" /> {result.title}</span>
            <div className="mt-4 space-y-1 text-sm text-muted deva">
              {result.to && <div><span className="font-semibold text-graphite">{t("gen.to")}: </span>{result.to}</div>}
              <div><span className="font-semibold text-graphite">{t("gen.subject")}: </span>{result.subject}</div>
            </div>
            <div className="mt-4">
              <CopyBlock text={result.letter} />
            </div>
            <div className="mt-6 grid gap-7 sm:grid-cols-2 deva">
              <ListBlock title={t("gen.attach")} items={result.attachments || []} accent={meta.accent} />
              <ListBlock title={t("gen.tips")} items={result.tips || []} tone="good" />
            </div>
            {result._mock && <MockNote text={t("common.sample")} />}
          </ResultCard>
        </div>
      )}
    </FeatureShell>
  );
}
