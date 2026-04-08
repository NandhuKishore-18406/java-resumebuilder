import { formatSize } from "./utils";

const FILES_KEY = "rb_files";

export type DemoFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
};

export function getFiles(): DemoFile[] {
  try {
    const raw = sessionStorage.getItem(FILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addFile(file: File): DemoFile {
  const files = getFiles();
  const demoFile: DemoFile = {
    id: Date.now().toString(),
    name: file.name,
    size: file.size,
    type: file.type,
    addedAt: new Date().toISOString(),
  };

  const updated = [...files, demoFile];
  sessionStorage.setItem(FILES_KEY, JSON.stringify(updated));

  return demoFile;
}

export function deleteFile(id: string): void {
  const files = getFiles();
  const filtered = files.filter((f) => f.id !== id);
  sessionStorage.setItem(FILES_KEY, JSON.stringify(filtered));
}

export { formatSize };

/*
 * ── JAVA BACKEND FILE OPS (uncomment when ready) ──────────────────────────────
 * GET    /api/files               → list file metadata (JDBI)
 * POST   /api/files/upload        → multipart upload → disk/S3 + JDBI record
 * DELETE /api/files/:id           → removes file + DB record
 * GET    /api/files/:id/download  → streams file bytes
 *
 * Replace demoFiles.ts functions with fetch() calls + getAuthHeaders()
 *
 * DB table (JDBI):
 *   files(id, user_id, original_name, file_size, mime_type, stored_path, created_at)
 * ─────────────────────────────────────────────────────────────────────────────
 */