import { type ResumeFields, type ResumeEducationEntry, type ResumeProjectEntry, type ResumeExpEntry, type ResumeAchEntry, type ResumeCertEntry } from "./storage";
import { api } from "./api";

export type ResumeData = {
  fields: ResumeFields;
  education: ResumeEducationEntry[];
  projects: ResumeProjectEntry[];
  experience: ResumeExpEntry[];
  achievements: ResumeAchEntry[];
  certificates: ResumeCertEntry[];
};

export type ResumeSnapshot = {
  id: number;
  label: string;
  savedAt: string;
  resumeData: ResumeData;
};

export async function getHistory(): Promise<ResumeSnapshot[]> {
  try {
    const history = await api.get<any[]>("/api/resume/history");
    return history.map((h: any) => ({
      id: h.id,
      label: h.label,
      savedAt: h.savedAt,
      resumeData: typeof h.resumeData === "string" ? JSON.parse(h.resumeData) : h.resumeData,
    }));
  } catch {
    return [];
  }
}

export async function saveSnapshot(data: ResumeData): Promise<ResumeSnapshot> {
  const history = await getHistory();
  const now = new Date();

  const snapshot = await api.post<any>("/api/resume/history", {
    label: `Version ${history.length + 1}`,
    savedAt: now.toISOString(),
    resumeData: JSON.stringify(data),
  });

  return {
    id: snapshot.id,
    label: snapshot.label,
    savedAt: snapshot.savedAt,
    resumeData: typeof snapshot.resumeData === "string" ? JSON.parse(snapshot.resumeData) : snapshot.resumeData,
  };
}

export async function deleteSnapshot(id: number): Promise<void> {
  await api.delete(`/api/resume/history/${id}`);
}

export function restoreSnapshot(id: number, history: ResumeSnapshot[]): ResumeData | null {
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