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
  { name: "Bengali", native: "বাংলা", speech: "bn-IN", iso: "bn" },
  { name: "Tamil", native: "தமிழ்", speech: "ta-IN", iso: "ta" },
  { name: "Telugu", native: "తెలుగు", speech: "te-IN", iso: "te" },
  { name: "Marathi", native: "मराठी", speech: "mr-IN", iso: "mr" },
  { name: "Gujarati", native: "ગુજરાતી", speech: "gu-IN", iso: "gu" },
  { name: "Kannada", native: "ಕನ್ನಡ", speech: "kn-IN", iso: "kn" },
  { name: "Malayalam", native: "മലയാളം", speech: "ml-IN", iso: "ml" },
  { name: "Punjabi", native: "ਪੰਜਾਬੀ", speech: "pa-IN", iso: "pa" },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
