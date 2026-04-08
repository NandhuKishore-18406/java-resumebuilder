"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FolderOpen, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DemoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
}

const FILES_KEY = "rb_files";

function getFiles(): DemoFile[] {
  try {
    const raw = sessionStorage.getItem(FILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addFile(file: File): DemoFile {
  const files = getFiles();
  const newFile: DemoFile = {
    id: Date.now().toString(),
    name: file.name,
    size: file.size,
    type: file.type,
    addedAt: new Date().toISOString(),
  };
  const updated = [newFile, ...files];
  sessionStorage.setItem(FILES_KEY, JSON.stringify(updated));
  return newFile;
}

function deleteFile(id: string): void {
  const files = getFiles().filter((f) => f.id !== id);
  sessionStorage.setItem(FILES_KEY, JSON.stringify(files));
}

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<DemoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setFiles(getFiles());
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      addFile(file);
      setFiles(getFiles());
      setUploading(false);
      setUploadProgress(0);
      toast.success("File uploaded successfully!");
    }, 800);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteFile(deleteId);
    setFiles(getFiles());
    setDeleteId(null);
    toast.success("File deleted");
  };

  const handleDownload = () => {
    toast.info("Download not available in demo mode");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">File Manager</h1>
        <p className="text-muted-foreground">All your uploaded files in one place.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Your Files</h2>
            <div className="flex gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload File
              </Button>
            </div>
          </div>

          {uploading && (
            <div className="mb-6">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {files.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              heading="No files uploaded"
              description="Upload documents, certificates, or transcripts to keep them in one place."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date · Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📎</span>
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-secondary text-secondary-foreground">
                          {getFileExtension(file.name)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.addedAt)} · {formatSize(file.size)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(file.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}