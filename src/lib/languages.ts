export interface Language {
  /** value used internally + sent to the AI ("respond in Hindi") */
  name: string;
  /** native display name */
  native: string;
  /** BCP-47 locale for Web Speech API */
  speech: string;
  /** ISO for the lang attribute */
  iso: string;
}

export const LANGUAGES: Language[] = [
  { name: "English", native: "English", speech: "en-IN", iso: "en" },
  { name: "Hindi", native: "हिन्दी", speech: "hi-IN", iso: "hi" },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
