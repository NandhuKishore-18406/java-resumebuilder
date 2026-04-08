import { type ResumeFields, type ResumeEducationEntry, type ResumeProjectEntry, type ResumeExpEntry, type ResumeAchEntry, type ResumeCertEntry } from "./storage";

export type ResumeData = {
  fields: ResumeFields;
  education: ResumeEducationEntry[];
  projects: ResumeProjectEntry[];
  experience: ResumeExpEntry[];
  achievements: ResumeAchEntry[];
  certificates: ResumeCertEntry[];
};

export type ResumeSnapshot = {
  id: string;
  label: string;       // "Version 3" or "Saved Apr 12, 2:30 PM"
  savedAt: string;     // ISO timestamp
  resumeData: ResumeData;
};

const HISTORY_KEY = "rb_resume_history";
const MAX_SNAPSHOTS = 4;

export function getHistory(): ResumeSnapshot[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSnapshot(data: ResumeData): ResumeSnapshot {
  const history = getHistory();
  const now = new Date();
  const id = Date.now().toString();

  const snapshot: ResumeSnapshot = {
    id,
    label: `Version ${history.length + 1}`,
    savedAt: now.toISOString(),
    resumeData: data,
  };

  // Add to beginning and trim to max
  const updated = [snapshot, ...history].slice(0, MAX_SNAPSHOTS);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

  return snapshot;
}

export function deleteSnapshot(id: string): void {
  const history = getHistory();
  const filtered = history.filter((s) => s.id !== id);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function restoreSnapshot(id: string): ResumeData | null {
  const history = getHistory();
  const snapshot = history.find((s) => s.id === id);
  return snapshot?.resumeData || null;
}

export function getSnapshotLabel(date: string): string {
  const d = new Date(date);
  return `Saved ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/*
 * ── JAVA BACKEND HISTORY (uncomment when ready) ───────────────────────────────
 * GET    /api/resume/history        → array of up to 4 snapshots (desc by date)
 * POST   /api/resume/history        → body: { resumeData }, saves new snapshot
 * DELETE /api/resume/history/:id    → deletes snapshot
 *
 * DB table (JDBI):
 *   resume_history(id, user_id, label, saved_at, resume_data JSONB)
 * ─────────────────────────────────────────────────────────────────────────────
 */