// Deterministic productivity logic for Samay — forecast, reality-check,
// recurrence, filters, rescue triage, and calendar export. No randomness.

export type Recur = "none" | "daily" | "weekdays" | "weekly";
export interface Task {
  id: number;
  title: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
  deadline?: string; // ISO or datetime-local
  estimateMins?: number;
  recur?: Recur;
}
export interface Goal { id: number; title: string; target: number; progress: number; }
export interface Habit { id: number; name: string; dates: string[]; }

export const WORK_HRS = 6; // assumed focus hours per day
export const todayStr = () => new Date().toISOString().slice(0, 10);

/** Probability (%) a task finishes on time, from time-to-deadline vs estimate. */
export function onTimeProb(task: Task, now = Date.now(), workHrs = WORK_HRS): number | null {
  if (!task.deadline) return null;
  const dl = new Date(task.deadline).getTime();
  if (isNaN(dl)) return null;
  if (dl <= now) return task.done ? 100 : 5;
  const days = (dl - now) / 86400000;
  const available = Math.max(0.25, days * workHrs);
  const est = Math.max(0.1, (task.estimateMins ?? 60) / 60);
  const r = available / est;
  return r >= 2 ? 94 : r >= 1.5 ? 85 : r >= 1 ? 72 : r >= 0.7 ? 55 : r >= 0.5 ? 38 : r >= 0.3 ? 22 : 10;
}

/** Greedy deadline-feasibility: how many pending tasks realistically finish on time. */
export function realityCheck(tasks: Task[], now = Date.now(), workHrs = WORK_HRS) {
  const pend = tasks
    .filter((t) => !t.done && t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  let onTime = 0, risk = 0, cum = 0;
  for (const t of pend) {
    cum += Math.max(0.1, (t.estimateMins ?? 60) / 60);
    const days = Math.max(0.25, (new Date(t.deadline!).getTime() - now) / 86400000);
    if (cum <= days * workHrs) onTime++; else risk++;
  }
  const totalHrs = pend.reduce((s, t) => s + (t.estimateMins ?? 60) / 60, 0);
  return { total: pend.length, onTime, risk, totalHrs: Math.round(totalHrs) };
}

export function nextRecurrence(deadline: string, recur: Recur): string {
  const d = new Date(deadline);
  if (recur === "daily") d.setDate(d.getDate() + 1);
  else if (recur === "weekly") d.setDate(d.getDate() + 7);
  else if (recur === "weekdays") { do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6); }
  return d.toISOString();
}

/* filters */
export const isOverdue = (t: Task) => !!t.deadline && !t.done && new Date(t.deadline).getTime() < Date.now();
export const inToday = (t: Task) => !!t.deadline && new Date(t.deadline).toDateString() === new Date().toDateString();
export const inWeek = (t: Task) => {
  if (!t.deadline) return false;
  const d = new Date(t.deadline).getTime();
  return d >= Date.now() - 86400000 && d <= Date.now() + 7 * 86400000;
};

/** Top 3 next actions for Rescue Mode. */
export function rescue(tasks: Task[]): Task[] {
  const pend = tasks.filter((t) => !t.done);
  const score = (t: Task) => {
    let s = t.priority === "High" ? 50 : t.priority === "Medium" ? 25 : 0;
    if (isOverdue(t)) s += 1000;
    if (t.deadline) s += 400 - Math.min(400, ((new Date(t.deadline).getTime() - Date.now()) / 86400000) * 12);
    return s;
  };
  return [...pend].sort((a, b) => score(b) - score(a)).slice(0, 3);
}

/* calendar */
const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export function gcalLink(t: Task): string {
  const start = t.deadline ? new Date(t.deadline) : new Date();
  const end = new Date(start.getTime() + (t.estimateMins ?? 60) * 60000);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent("Scheduled via Saarthi · Samay")}`;
}
export function buildICS(tasks: Task[]): string {
  const events = tasks.filter((t) => t.deadline).map((t) => {
    const start = new Date(t.deadline!);
    const end = new Date(start.getTime() + (t.estimateMins ?? 60) * 60000);
    return ["BEGIN:VEVENT", `UID:${t.id}@saarthi`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${t.title.replace(/\n/g, " ")}`, "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM", "END:VEVENT"].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Saarthi//Samay//EN", ...events, "END:VCALENDAR"].join("\r\n");
}
export function downloadICS(tasks: Task[]) {
  const blob = new Blob([buildICS(tasks)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "samay-deadlines.ics"; a.click();
  URL.revokeObjectURL(url);
}

/* habit streak: consecutive days up to today present in dates[] */
export function habitStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (set.has(key)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}
