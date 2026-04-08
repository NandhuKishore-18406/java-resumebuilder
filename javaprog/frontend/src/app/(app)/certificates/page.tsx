"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppState } from "@/hooks/useAppState";
import { toast } from "sonner";
import { Award, Upload, X, Trash2 } from "lucide-react";

interface PendingCertificate {
  title: string;
  name: string;
  org: string;
  year: string;
}

export default function CertificatesPage() {
  const { state, updateState } = useAppState();
  const { savedCertificates } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingCert, setPendingCert] = useState<PendingCertificate | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    const title = file.name.replace(/\.[^.]+$/, "");
    const { profile } = state;
    setPendingCert({
      title,
      name: profile?.name || "",
      org: "",
      year: new Date().getFullYear().toString(),
    });
  };

  const handleInputChange = (field: keyof PendingCertificate, value: string) => {
    setPendingCert((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleConfirmCertificate = () => {
    if (!pendingCert) return;

    const newCert = {
      id: Date.now(),
      ...pendingCert,
    };

    const updated = [...savedCertificates, newCert];
    updateState({ savedCertificates: updated });

    toast.success("Certificate saved and added to your profile!");
    setPendingCert(null);
  };

  const handleDeleteCertificate = (id: number) => {
    const updated = savedCertificates.filter((c) => c.id !== id);
    updateState({ savedCertificates: updated });
    toast.success("Certificate deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Certificates</h1>
        <p className="text-muted-foreground">
          Upload certificates — saved data appears in your profile and resume automatically.
        </p>
      </div>

      {/* Upload Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Click to upload or drag & drop</p>
            <p className="text-sm text-muted-foreground">
              Supports PDF and image files (PNG, JPG)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </CardContent>
      </Card>

      {/* Pending Certificate Preview */}
      {pendingCert && (
        <Card className="border-primary/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                Extracted Data
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPendingCert(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certTitle">Certificate Title</Label>
                <Input
                  id="certTitle"
                  placeholder="Auto-extracted title"
                  value={pendingCert.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certName">Recipient Name</Label>
                <Input
                  id="certName"
                  placeholder="Auto-extracted name"
                  value={pendingCert.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certOrg">Issuing Organization</Label>
                  <Input
                    id="certOrg"
                    placeholder="Organization"
                    value={pendingCert.org}
                    onChange={(e) => handleInputChange("org", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certYear">Year</Label>
                  <Input
                    id="certYear"
                    placeholder="Year"
                    value={pendingCert.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirmCertificate}>Confirm & Save</Button>
                <Button
                  variant="ghost"
                  onClick={() => setPendingCert(null)}
                >
                  Discard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Certificates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Saved Certificates</h2>

        {savedCertificates.length === 0 ? (
          <EmptyState
            icon={Award}
            heading="No certificates yet"
            description="Upload a certificate above to get started."
          />
        ) : (
          <div className="grid gap-3">
            {savedCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cert.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.org && `${cert.org} · `}
                      {cert.year}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCertificate(cert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}