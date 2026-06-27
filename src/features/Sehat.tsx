import { useRef, useState } from "react";
import { Send, ImagePlus, X, Pill, Stethoscope, IndianRupee, Info } from "lucide-react";
import { useApp } from "../app/AppContext";
import { featureByKey } from "../lib/features";
import { callFeature, fileToInlineData } from "../lib/api";
import { useVoice } from "../hooks/useVoice";
import { FeatureShell } from "../components/FeatureShell";
import { Thinking, VoiceButton, ListBlock, ResultCard, MockNote } from "../components/ui";

interface Medicine {
  brandName: string;
  genericName: string;
  purpose: string;
  howToTake?: string;
  estBrandPrice?: string;
  estGenericPrice?: string;
  savingsNote?: string;
}
interface SehatResult {
  summary: string;
  mode: string;
  medicines?: Medicine[];
  triage?: string[];
  janAushadhiNote?: string;
  whenToSeeDoctor?: string[];
  disclaimer?: string;
  _mock?: boolean;
}

const EX_RX = "Glycomet 500mg twice daily, Ecosprin 75 once at night, Atorva 10 at bedtime.";
const EX_SYM = "Mild fever since yesterday, body ache, slight sore throat, no breathing trouble.";

export function Sehat({ onBack }: { onBack: () => void }) {
  const meta = featureByKey("sehat");
  const { t, lang } = useApp();
  const [mode, setMode] = useState<"prescription" | "symptom">("prescription");
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SehatResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voice = useVoice(lang.speech, setText);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await fileToInlineData(file));
    setPreview(URL.createObjectURL(file));
  }

  async function run() {
    if (!text.trim() && !image) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await callFeature<SehatResult>("sehat", { text, mode, image, language: lang.name });
      setResult(data);
    } catch {
      /* mock fallback */
    } finally {
      setLoading(false);
    }
  }

  return (
    <FeatureShell meta={meta} onBack={onBack}>
      <div className="card p-6 sm:p-7">
        {/* mode switch */}
        <div className="mb-5 inline-flex rounded-full border border-line bg-mist p-1">
          {([
            { id: "prescription", label: t("m.modeRx"), icon: Pill },
            { id: "symptom", label: t("m.modeSym"), icon: Stethoscope },
          ] as const).map(({ id, label, icon: Icon }) => (
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

        {preview && (
          <div className="relative mb-4 inline-block">
            <img src={preview} alt="prescription" className="max-h-48 rounded-2xl border border-line" />
            <button
              onClick={() => {
                setImage(null);
                setPreview("");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === "prescription" ? t("m.phRx") : t("m.phSym")}
          rows={4}
          className="field resize-none deva"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={run} disabled={loading || (!text.trim() && !image)} className="btn-accent text-[15px]">
            <Send className="h-4 w-4" />
            {t("common.run")}
          </button>
          {mode === "prescription" && (
            <>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">
                <ImagePlus className="h-4 w-4" />
                {t("common.upload")}
              </button>
            </>
          )}
          {voice.supported && (
            <VoiceButton
              listening={voice.listening}
              onClick={() => (voice.listening ? voice.stop() : voice.start(text))}
              speakLabel={t("common.speak")}
              listeningLabel={t("common.listening")}
            />
          )}
          <button onClick={() => setText(mode === "prescription" ? EX_RX : EX_SYM)} className="btn-ghost text-sm">
            {t("common.example")}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card mt-6 p-8">
          <Thinking label={t("common.running")} />
        </div>
      )}

      {result && !loading && (
        <div className="mt-6">
          <ResultCard accent={meta.accent}>
            <p className="display text-xl font-semibold leading-snug deva">{result.summary}</p>

            {result.medicines?.length ? (
              <div className="mt-6 space-y-4">
                {result.medicines.map((m, i) => (
                  <div key={i} className="rounded-2xl border border-line bg-mist/40 p-5 deva">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-lg font-semibold text-ink">{m.brandName}</h4>
                      <span className="text-sm text-muted">{m.genericName}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-graphite">
                      <span className="font-medium">{t("m.purpose")}:</span> {m.purpose}
                    </p>
                    {m.howToTake && (
                      <p className="mt-1 text-sm text-muted">
                        <span className="font-medium text-graphite">{t("m.howtake")}:</span> {m.howToTake}
                      </p>
                    )}
                    {(m.estBrandPrice || m.estGenericPrice) && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {m.estBrandPrice && (
                          <span className="rounded-xl bg-paper px-3 py-1.5 text-sm text-muted line-through">
                            {t("m.brand")}: {m.estBrandPrice}
                          </span>
                        )}
                        {m.estGenericPrice && (
                          <span className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-semibold text-white" style={{ background: meta.accent }}>
                            <IndianRupee className="h-3.5 w-3.5" />
                            {t("m.generic")}: {m.estGenericPrice}
                          </span>
                        )}
                        {m.savingsNote && <span className="text-sm font-medium text-verdant">{m.savingsNote}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {result.triage?.length ? (
              <div className="mt-6 deva">
                <ListBlock title={t("m.triage")} items={result.triage} accent={meta.accent} />
              </div>
            ) : null}

            {result.janAushadhiNote && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-verdant/20 bg-verdant/[0.05] p-5 deva">
                <Info className="mt-0.5 h-5 w-5 flex-none text-verdant" />
                <div>
                  <div className="text-sm font-semibold text-verdant">{t("m.jan")}</div>
                  <p className="mt-1 text-sm text-graphite">{result.janAushadhiNote}</p>
                </div>
              </div>
            )}

            {result.whenToSeeDoctor?.length ? (
              <div className="mt-6 rounded-2xl border border-danger/20 bg-danger/[0.04] p-5 deva">
                <ListBlock title={t("m.doctor")} items={result.whenToSeeDoctor} tone="warn" />
              </div>
            ) : null}

            {result.disclaimer && (
              <p className="mt-5 text-xs leading-relaxed text-faint deva">{result.disclaimer}</p>
            )}

            {result._mock && <MockNote text={t("common.sample")} />}
          </ResultCard>
        </div>
      )}
    </FeatureShell>
  );
}
