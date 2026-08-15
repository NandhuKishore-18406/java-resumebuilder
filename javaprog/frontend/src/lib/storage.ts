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
  education?: string | Education[];
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
  name?: string;
  degree_short?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  summary?: string;
  prog_langs?: string;
  frameworks?: string;
  databases?: string;
  tools?: string;
  softskills?: string;
  interests?: string;
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

const DEFAULT_STATE: AppState = {
  profile: {},
  savedCertificates: [],
  seminars: { completed: [], queue: [] },
};

import { api } from "./api";

function parseJsonArray<T>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function getState(): Promise<AppState> {
  try {
    const [rawProfile, certs, seminars] = await Promise.all([
      api.get<any>("/api/profile").catch(() => null),
      api.get<any[]>("/api/certificates").catch(() => []),
      api.get<{ completed: any[]; queue: any[] }>("/api/seminars").catch(() => ({ completed: [], queue: [] })),
    ]);

    const formattedProfile: Profile = rawProfile ? { ...rawProfile } : {};
    if (rawProfile) {
      formattedProfile.edu = parseJsonArray<Education>(rawProfile.education || rawProfile.edu);
      formattedProfile.projects = parseJsonArray<Project>(rawProfile.projects);
      formattedProfile.experience = parseJsonArray<Experience>(rawProfile.experience);
      formattedProfile.publications = parseJsonArray<Publication>(rawProfile.publications);
    }

    return {
      profile: formattedProfile,
      savedCertificates: certs || [],
      seminars: seminars || { completed: [], queue: [] },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(patch: Partial<AppState>): Promise<void> {
  if (patch.profile) {
    const p: any = { ...patch.profile };
    p.education = Array.isArray(p.edu) ? JSON.stringify(p.edu) : p.education;
    p.projects = Array.isArray(p.projects) ? JSON.stringify(p.projects) : p.projects;
    p.experience = Array.isArray(p.experience) ? JSON.stringify(p.experience) : p.experience;
    p.publications = Array.isArray(p.publications) ? JSON.stringify(p.publications) : p.publications;
    await api.put("/api/profile", p);
  }
}