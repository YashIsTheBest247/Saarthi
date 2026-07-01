import { useState } from "react";
import { Siren, Phone, MessageCircle, User } from "lucide-react";
import { useLocal } from "../features/console/kit";
import { useApp } from "../app/AppContext";

/** Detects an emergency in free text (English + Hindi) — used to surface the alert. */
export const SOS_RE = /\b(accident|emergency|injured|injury|bleeding|unconscious|collapse|trapped|fire|drowning|attack|assault|harass(?:ing|ed|ment)?|stalk(?:ing|er)?|following me|unsafe|molest|kidnap|abduct|suicide|fainted|heart attack|stroke|snake ?bite|electrocut|gas leak|landslide|flood|save me|help me)\b|दुर्घटना|आपातकाल|घायल|बचाओ|आग लग|हादसा|पीछा कर|छेड़|असुरक्षित/i;

/**
 * "Alert my emergency contact" — a per-device (localStorage) contact you can SMS /
 * WhatsApp / call in one tap, with your live location attached if you allow it.
 */
export function SosAlert({ situation = "", domain = "this", accent = "#C0453B" }: { situation?: string; domain?: string; accent?: string }) {
  const { t } = useApp();
  const [contact, setContact] = useLocal<{ name: string; phone: string }>("saarthi.sos.contact", { name: "", phone: "" });
  const [showSet, setShowSet] = useState(false);

  function alertContact(channel: "sms" | "wa") {
    const phone = contact.phone.replace(/[^\d+]/g, "");
    if (!phone) { setShowSet(true); return; }
    const base = `${t("sosc.msgHead").replace("{domain}", domain)} ${situation ? t("sosc.msgDetails").replace("{situation}", situation) + " " : ""}${t("sosc.msgTail")}`;
    const go = (loc?: string) => {
      const body = encodeURIComponent(base + (loc ? ` ${t("sosc.msgLoc").replace("{loc}", loc)}` : ""));
      const url = channel === "wa" ? `https://wa.me/${phone.replace(/^\+/, "")}?text=${body}` : `sms:${phone}?body=${body}`;
      window.open(url, "_blank");
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => go(`https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`),
        () => go(),
        { timeout: 4000 },
      );
    } else go();
  }

  return (
    <div className="rounded-2xl border border-[#C0453B]/25 bg-[#C0453B]/5 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <User className="h-4 w-4 flex-none text-[#C0453B]" />
        <span className="text-sm font-semibold text-graphite deva">{t("sosc.contact")}{contact.name ? ` · ${contact.name}` : ""}</span>
        {contact.phone ? (
          <>
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="btn-ghost text-sm"><Phone className="h-4 w-4" /> {t("sosc.call")}</a>
            <button onClick={() => alertContact("sms")} className="btn-accent text-sm" style={{ background: accent }}><Siren className="h-4 w-4" /> {t("sosc.alertSms")}</button>
            <button onClick={() => alertContact("wa")} className="btn-ghost text-sm"><MessageCircle className="h-4 w-4" /> WhatsApp</button>
            <button onClick={() => setShowSet((s) => !s)} className="ml-auto text-xs font-medium text-faint hover:text-ink deva">{t("sosc.edit")}</button>
          </>
        ) : (
          <button onClick={() => setShowSet(true)} className="btn-ghost text-sm deva">{t("sosc.setContact")}</button>
        )}
      </div>
      {showSet && (
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder={t("sosc.namePh")} className="field !rounded-xl !py-2 text-sm" />
          <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder={t("sosc.phonePh")} className="field !rounded-xl !py-2 text-sm" />
          <button onClick={() => setShowSet(false)} className="btn-accent text-sm" style={{ background: accent }}>{t("sosc.save")}</button>
        </div>
      )}
      <p className="mt-2 text-xs text-faint deva">{t("sosc.note")}</p>
    </div>
  );
}
