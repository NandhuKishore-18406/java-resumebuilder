import { formatSize } from "./utils";
import { api } from "./api";

export type DemoFile = {
  id: number;
  originalName: string;
  fileSize: number;
  mimeType?: string;
  storedPath?: string;
};

export async function getFiles(): Promise<DemoFile[]> {
  try {
    return await api.get<DemoFile[]>("/api/files");
  } catch {
    return [];
  }
}

export async function addFile(file: File): Promise<DemoFile> {
  const demoFile: DemoFile = {
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };

  return await api.post<DemoFile>("/api/files", demoFile);
}

export async function deleteFile(id: number): Promise<void> {
  await api.delete(`/api/files/${id}`);
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