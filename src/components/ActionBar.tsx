import { useState } from "react";
import { FileDown, Mail, MessageCircle, Smartphone, CalendarPlus, Copy, Check, Loader2, Send } from "lucide-react";
import { sendToSmriti, downloadICS, parseWhen } from "../lib/reminders";

/**
 * Turns any agent deliverable into ACTIONS, not just text — so Saarthi *does*
 * things: save a PDF, email it, WhatsApp/SMS it, or set a reminder.
 */
export function ActionBar({ title, text, deadline, accent = "#2D6BFF" }: { title: string; text: string; deadline?: string; accent?: string }) {
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [open, setOpen] = useState<"" | "email" | "wa" | "sms">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState<"" | "sending" | "sent" | "mock" | "err">("");

  const copy = () => { try { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } };

  async function savePdf() {
    setPdfBusy(true);
    try {
      const res = await fetch("/api/doc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, text, format: "pdf" }) });
      if (res.ok) {
        const blob = await res.blob();
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = u; a.download = (title || "saarthi").replace(/[^a-z0-9]+/gi, "_").slice(0, 40) + ".pdf"; a.click();
        URL.revokeObjectURL(u);
      }
    } catch { /* */ } finally { setPdfBusy(false); }
  }

  async function sendEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMail("err"); return; }
    setMail("sending");
    try {
      const res = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: email.trim(), title, message: text }) });
      const j = await res.json();
      setMail(!res.ok || j.ok === false ? "err" : j._mock ? "mock" : "sent");
    } catch { setMail("err"); }
  }

  function openMsg(kind: "wa" | "sms") {
    const num = phone.replace(/[^\d+]/g, "");
    if (!num) { setOpen(kind); return; }
    const body = encodeURIComponent(`${title ? title + "\n\n" : ""}${text}`);
    window.open(kind === "wa" ? `https://wa.me/${num.replace(/^\+/, "")}?text=${body}` : `sms:${num}?body=${body}`, "_blank");
    setOpen("");
  }

  function saveReminder() {
    sendToSmriti({ title: title || "Reminder", deadline, priority: "High", source: "Saarthi" });
    downloadICS([{ title: title || "Reminder", deadline: parseWhen(deadline).toISOString() }], "saarthi-reminder.ics");
    setReminded(true); setTimeout(() => setReminded(false), 2500);
  }

  const btn = "inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-graphite hover:bg-mist transition-colors";

  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-faint">Do it →</div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={savePdf} disabled={pdfBusy} className={btn}>{pdfBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" style={{ color: accent }} />} Save PDF</button>
        <button onClick={() => setOpen(open === "email" ? "" : "email")} className={btn}><Mail className="h-3.5 w-3.5" style={{ color: accent }} /> Email</button>
        <button onClick={() => openMsg("wa")} className={btn}><MessageCircle className="h-3.5 w-3.5" style={{ color: accent }} /> WhatsApp</button>
        <button onClick={() => openMsg("sms")} className={btn}><Smartphone className="h-3.5 w-3.5" style={{ color: accent }} /> SMS</button>
        <button onClick={saveReminder} className={btn}>{reminded ? <Check className="h-3.5 w-3.5 text-[#2E6F52]" /> : <CalendarPlus className="h-3.5 w-3.5" style={{ color: accent }} />} {reminded ? "Saved" : "Remind me"}</button>
        <button onClick={copy} className={btn}>{copied ? <Check className="h-3.5 w-3.5 text-[#2E6F52]" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}</button>
      </div>

      {open === "email" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input value={email} onChange={(e) => { setEmail(e.target.value); setMail(""); }} placeholder="your@email.com" className="min-w-[12rem] flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-[#2D6BFF]" />
          <button onClick={sendEmail} disabled={mail === "sending" || mail === "sent" || mail === "mock"} className="btn-accent text-sm" style={{ background: accent }}>
            {mail === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : mail === "sent" || mail === "mock" ? <><Check className="h-4 w-4" /> Sent</> : <><Send className="h-4 w-4" /> Send</>}
          </button>
          {mail === "mock" && <span className="text-xs text-faint">(demo — set SMTP to send for real)</span>}
          {mail === "err" && <span className="text-xs text-danger">Enter a valid email.</span>}
        </div>
      )}
      {(open === "wa" || open === "sms") && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (+91…)" className="min-w-[10rem] flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-[#2D6BFF]" />
          <button onClick={() => openMsg(open)} className="btn-accent text-sm" style={{ background: accent }}>{open === "wa" ? <MessageCircle className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />} Open {open === "wa" ? "WhatsApp" : "SMS"}</button>
        </div>
      )}
    </div>
  );
}
