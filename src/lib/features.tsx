import { ShieldCheck, ScanText, Landmark, HeartPulse, LucideIcon } from "lucide-react";
import { FeatureKey } from "./api";

export interface Stat {
  v: string;
  l: string;
}

export interface FeatureMeta {
  key: FeatureKey;
  icon: LucideIcon;
  nameKey: string;
  tagKey: string;
  descKey: string;
  personaKey: string;
  accent: string;
  accentDark: string;
  tint: string;
  photo: string;
  index: string;
  badge?: string; // e.g. "New"
  stats: Stat[]; // shown in the mega-menu "Powered by AI" panel
}

export const FEATURES: FeatureMeta[] = [
  {
    key: "kavach",
    icon: ShieldCheck,
    nameKey: "k.name",
    tagKey: "k.tag",
    descKey: "k.desc",
    personaKey: "k.persona",
    accent: "#2D6BFF",
    accentDark: "#1A49BD",
    tint: "#E8F0FE",
    photo: "/agents/kavach.jpg",
    index: "01",
    stats: [
      { v: "₹22,800Cr", l: "lost to cyber fraud in India yearly" },
      { v: "60 sec", l: "to check any message or call" },
      { v: "24×7", l: "always-on protection" },
      { v: "1930", l: "cyber helpline built in" },
    ],
  },
  {
    key: "samajh",
    icon: ScanText,
    nameKey: "s.name",
    tagKey: "s.tag",
    descKey: "s.desc",
    personaKey: "s.persona",
    accent: "#C2641F",
    accentDark: "#9C4F18",
    tint: "#FBEEDD",
    photo: "/agents/samajh.jpg",
    index: "02",
    stats: [
      { v: "30 sec", l: "to decode any document" },
      { v: "100%", l: "plain-language, no jargon" },
      { v: "any", l: "bill, notice, policy or letter" },
      { v: "₹0", l: "no charge, no login" },
    ],
  },
  {
    key: "haq",
    icon: Landmark,
    nameKey: "h.name",
    tagKey: "h.tag",
    descKey: "h.desc",
    personaKey: "h.persona",
    accent: "#1F7A55",
    accentDark: "#155041",
    tint: "#E4F3EC",
    photo: "/agents/haq.jpg",
    index: "03",
    badge: "New",
    stats: [
      { v: "₹ Lakhs Cr", l: "welfare unclaimed every year" },
      { v: "500+", l: "central & state schemes known" },
      { v: "5–8", l: "matches per profile" },
      { v: "step-by-step", l: "how to apply guidance" },
    ],
  },
  {
    key: "sehat",
    icon: HeartPulse,
    nameKey: "m.name",
    tagKey: "m.tag",
    descKey: "m.desc",
    personaKey: "m.persona",
    accent: "#C0453B",
    accentDark: "#9A352D",
    tint: "#FBE9EA",
    photo: "/agents/sehat.jpg",
    index: "04",
    badge: "New",
    stats: [
      { v: "50–90%", l: "saved with generic medicines" },
      { v: "₹540/mo", l: "typical prescription saving" },
      { v: "Jan Aushadhi", l: "nearest-store guidance" },
      { v: "24×7", l: "safe health guidance" },
    ],
  },
];

export const featureByKey = (k: FeatureKey) => FEATURES.find((f) => f.key === k)!;
