import { useState } from "react";
import { AlertTriangle, Phone, MessageSquare, Mail, Smartphone, Send } from "lucide-react";
import { useApp } from "../app/AppContext";
import { featureByKey } from "../lib/features";
import { callFeature } from "../lib/api";
import { useVoice } from "../hooks/useVoice";
import { FeatureShell } from "../components/FeatureShell";
import { Reveal, Thinking, VoiceButton, ListBlock, ResultCard, MockNote } from "../components/ui";
import { RiskRing } from "../components/Landing";

interface KavachResult {
  riskScore: number;
  verdict: string;
  category: string;
  headline: string;
  summary: string;
  redFlags?: { flag: string; explanation: string }[];
  safeActions?: string[];
  ifVictim?: string[];
  helpline: string;
  _mock?: boolean;
}

const CHANNELS = [
  { id: "SMS", icon: MessageSquare },
  { id: "WhatsApp", icon: Smartphone },
  { id: "Call", icon: Phone },
  { id: "Email", icon: Mail },
];

const EXAMPLE =
  "Dear customer, your electricity will be disconnected tonight 9:30 PM as your previous bill was not updated. Immediately contact our officer 8XXXXXXXXX to avoid disconnection. -Electricity Office";

const verdictColor = (v: string) =>
  /scam|danger/i.test(v) ? "#B23A2E" : /suspicious/i.test(v) ? "#C98A17" : "#1F6F5C";

export function Kavach({ onBack }: { onBack: () => void }) {
  const meta = featureByKey("kavach");
  const { t, lang } = useApp();
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KavachResult | null>(null);
  const voice = useVoice(lang.speech, setMessage);

  async function run() {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await callFeature<KavachResult>("kavach", { message, channel, language: lang.name });
      setResult(data);
    } catch {
      /* surfaced via mock fallback on server */
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeatureShell meta={meta} onBack={onBack}>
      {/* input */}
      <div className="card p-6 sm:p-7">
        <label className="mb-2 block text-sm font-semibold text-graphite">{t("k.channel")}</label>
        <div className="mb-5 flex flex-wrap gap-2">
          {CHANNELS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setChannel(id)}
              className={`btn px-4 py-2 text-sm border ${
                channel === id
                  ? "border-transparent text-white"
                  : "border-line bg-mist text-graphite hover:border-faint"
              }`}
              style={channel === id ? { background: meta.accent } : undefined}
            >
              <Icon className="h-4 w-4" />
              {id}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("k.ph")}
          rows={5}
          className="field resize-none deva"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || !message.trim()} className="btn-accent text-[15px]">
            <Send className="h-4 w-4" />
            {t("common.run")}
          </button>
          {voice.supported && (
            <VoiceButton
              listening={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(message))}
              speakLabel={t("common.speak")}
              listeningLabel={t("common.listening")}
            />
          )}
          <button onClick={() => setMessage(EXAMPLE)} className="btn-ghost text-sm">
            {t("common.example")}
          </button>
          {message && (
            <button onClick={() => setMessage("")} className="ml-auto text-sm text-faint hover:text-graphite">
              {t("common.clear")}
            </button>
          )}
        </div>
      </div>

      {/* result */}
      {loading && (
        <div className="card mt-6 p-8">
          <Thinking label={t("common.running")} />
        </div>
      )}

      {result && !loading && (
        <div className="mt-6">
          <ResultCard accent={verdictColor(result.verdict)}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <RiskRing value={result.riskScore} />
              <div className="flex-1">
                <span
                  className="text-xs font-bold uppercase tracking-[0.15em]"
                  style={{ color: verdictColor(result.verdict) }}
                >
                  {result.verdict} · {result.category}
                </span>
                <h3 className="display mt-1 text-2xl font-semibold leading-tight deva">{result.headline}</h3>
              </div>
            </div>

            <p className="deva mt-5 rounded-2xl bg-mist px-5 py-4 leading-relaxed text-graphite">{result.summary}</p>

            <div className="mt-6 grid gap-7 sm:grid-cols-2">
              {result.redFlags?.length ? (
                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("k.flags")}</h4>
                  <ul className="space-y-3">
                    {result.redFlags.map((f, i) => (
                      <li key={i} className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-danger" />
                        <span className="text-[15px] leading-relaxed text-graphite deva">
                          <span className="font-semibold">{f.flag}.</span> {f.explanation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="deva">
                <ListBlock title={t("k.safe")} items={result.safeActions || []} tone="good" />
              </div>
            </div>

            {result.ifVictim?.length ? (
              <div className="deva mt-6 rounded-2xl border border-danger/20 bg-danger/[0.04] p-5">
                <ListBlock title={t("k.victim")} items={result.ifVictim} tone="warn" />
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-white">
              <span className="text-xs uppercase tracking-wide text-clay-300">{t("common.helpline")}</span>
              <span className="font-semibold">{result.helpline}</span>
            </div>

            {result._mock && <MockNote text={t("common.sample")} />}
          </ResultCard>
        </div>
      )}
    </FeatureShell>
  );
}
