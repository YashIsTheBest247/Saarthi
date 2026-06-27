import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { FeatureMeta } from "../lib/features";
import { useApp } from "../app/AppContext";
import { LanguagePicker } from "./LanguagePicker";
import { StatusBadge } from "./ui";
import { AgentAvatar } from "./AgentAvatar";

export function FeatureShell({
  meta,
  onBack,
  children,
}: {
  meta: FeatureMeta;
  onBack: () => void;
  children: ReactNode;
}) {
  const { t, health } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl px-5 pb-24 pt-6"
    >
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="btn-ghost px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge live={health.live} label={health.live ? t("common.poweredReal") : t("common.poweredMock")} />
          <LanguagePicker compact />
        </div>
      </div>

      {/* agent header */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-none">
          <AgentAvatar
            photo={meta.photo}
            name={t(meta.nameKey)}
            tint={meta.tint}
            accent={meta.accent}
            rounded="rounded-2xl"
            className="h-16 w-16"
          />
          <span
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg text-white ring-2 ring-white"
            style={{ background: meta.accent }}
          >
            <meta.icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="display text-3xl font-bold deva">{t(meta.nameKey)}</h1>
            <span className="text-base font-medium" style={{ color: meta.accent }}>
              {t(meta.tagKey)}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-muted deva">{t(meta.personaKey)}</p>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </motion.div>
  );
}
