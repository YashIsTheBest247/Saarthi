import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for the vendor-prefixed Web Speech API.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export const voiceSupported =
  typeof window !== "undefined" &&
  Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

/**
 * Voice-to-text using the browser's Speech Recognition.
 * onText receives the cumulative transcript while the user speaks.
 */
export function useVoice(locale: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef("");

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    (existing = "") => {
      const rec = getRecognition();
      if (!rec) return;
      baseRef.current = existing ? existing.trim() + " " : "";
      rec.lang = locale;
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        onText(baseRef.current + transcript);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    },
    [locale, onText],
  );

  useEffect(() => () => recRef.current?.stop(), []);

  return { listening, start, stop, supported: voiceSupported };
}
