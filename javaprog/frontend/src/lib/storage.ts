export interface Certificate {
  id: number;
  title: string;
  name?: string;
  org: string;
  year: string;
}

export interface Seminar {
  id: number;
  title: string;
  org?: string;
  date?: string;
  notes?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  branch?: string;
  year?: string;
  cgpa?: string;
}

export interface Project {
  title: string;
  tech?: string;
  desc?: string;
  link?: string;
}

export interface Experience {
  id: number;
  role?: string;
  company?: string;
  period?: string;
  description?: string;
}

export interface Publication {
  id: number;
  title?: string;
  journal?: string;
  year?: string;
  authors?: string;
}

export interface Profile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  url?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  bio?: string;
  techskills?: string;
  frameworks?: string;
  databases?: string;
  tools?: string;
  softskills?: string;
  edu?: Education[];
  projects?: Project[];
  experience?: Experience[];
  publications?: Publication[];
  languages?: string[];
  awards?: string[];
  designation?: string;
  department?: string;
  institution?: string;
  vidwanId?: string;
  orcidId?: string;
  certificatesCount?: number;
  seminarsCount?: number;
}

export interface ResumeEducationEntry {
  id: number;
  institution?: string;
  degree?: string;
  branch?: string;
  year?: string;
  cgpa?: string;
}

export interface ResumeProjectEntry {
  id: number;
  title?: string;
  tech?: string;
  link?: string;
  desc?: string;
}

export interface ResumeExpEntry {
  id: number;
  role?: string;
  org?: string;
  period?: string;
  bullets?: string;
}

export interface ResumeAchEntry {
  id: number;
  rank?: string;
  title?: string;
  org?: string;
}

export interface ResumeCertEntry {
  id: number;
  title?: string;
  org?: string;
  year?: string;
}

export interface ResumeFields {
  rv_name?: string;
  rv_degree_short?: string;
  rv_email?: string;
  rv_phone?: string;
  rv_location?: string;
  rv_linkedin?: string;
  rv_github?: string;
  rv_leetcode?: string;
  rv_summary?: string;
  rv_prog_langs?: string;
  rv_frameworks?: string;
  rv_databases?: string;
  rv_tools?: string;
  rv_softskills?: string;
  rv_interests?: string;
}

export interface AppState {
  profile: Profile;
  savedCertificates: Certificate[];
  seminars: {
    completed: Seminar[];
    queue: Seminar[];
  };
  resumeEduEntries?: ResumeEducationEntry[];
  resumeProjectEntries?: ResumeProjectEntry[];
  resumeExpEntries?: ResumeExpEntry[];
  resumeAchEntries?: ResumeAchEntry[];
  resumeCertEntries?: ResumeCertEntry[];
  resumeFields?: ResumeFields;
}

const STATE_KEY = "rb_state";
const DEFAULT_STATE: AppState = {
  profile: {},
  savedCertificates: [],
  seminars: { completed: [], queue: [] },
};

import { api } from "./api";

export async function getState(): Promise<AppState> {
  try {
    const [profile, certs, seminars] = await Promise.all([
      api.get<any>("/api/profile").catch(() => null),
      api.get<any[]>("/api/certificates").catch(() => []),
      api.get<{ completed: any[]; queue: any[] }>("/api/seminars").catch(() => ({ completed: [], queue: [] })),
    ]);

    return {
      profile: profile || {},
      savedCertificates: certs || [],
      seminars: seminars || { completed: [], queue: [] },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(patch: Partial<AppState>): Promise<void> {
  if (patch.profile) {
    await api.put("/api/profile", patch.profile);
  }
}

/*
 * ── JAVA BACKEND STORAGE (uncomment when ready) ───────────────────────────────
 * Replace sessionStorage calls with JDBC/JDBI API calls:
 *
 * Profile:   GET/PUT  /api/profile
 * Certs:     GET/POST/DELETE /api/certificates/:id
 * Seminars:  GET/POST/PATCH/DELETE /api/seminars/:id
 * Files:     GET/POST /api/files/upload, DELETE/GET /api/files/:id/download
 * History:   GET/POST/DELETE /api/resume/history/:id
 *
 * All requests: headers: { Authorization: `Bearer ${token}` }
 * ─────────────────────────────────────────────────────────────────────────────
 */