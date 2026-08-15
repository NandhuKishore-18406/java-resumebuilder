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
  const demoFile: Omit<DemoFile, "id"> = {
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };

  return await api.post<DemoFile>("/api/files/upload", demoFile);
}

export async function deleteFile(id: number): Promise<void> {
  await api.delete(`/api/files/${id}`);
}

export { formatSize };