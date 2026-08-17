"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useAppState";
import { getHistory, deleteSnapshot, getSnapshotLabel, type ResumeSnapshot } from "@/lib/resumeHistory";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  FileText, 
  Award, 
  GraduationCap, 
  FolderOpen, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Trash2, 
  CheckCircle2,
  FileCheck,
  Zap,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [history, setHistory] = useState<ResumeSnapshot[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const firstName = profile?.name || user?.name || "";
  const greeting = firstName ? `Good ${timeOfDay}, ${firstName.split(" ")[0]}!` : `Good ${timeOfDay}!`;

  const loadResumeHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadResumeHistory();
  }, []);

  const handleDeleteHistory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingId(id);
    try {
      await deleteSnapshot(id);
      toast.success("Resume snapshot deleted");
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      toast.error("Failed to delete snapshot");
    } finally {
      setDeletingId(null);
    }
  };

  const workflowSteps = [
    {
      step: "01",
      title: "Fill Profile",
      description: "Enter contact details, education, skills, and projects in your central profile.",
      icon: User,
      href: "/profile"
    },
    {
      step: "02",
      title: "Generate Resume",
      description: "Auto-populate all fields with 'Generate from Profile' in the Resume Builder.",
      icon: FileText,
      href: "/resume-builder"
    },
    {
      step: "03",
      title: "Sync Credentials",
      description: "Add certificates and completed seminars — they sync automatically.",
      icon: Award,
      href: "/certificates"
    },
    {
      step: "04",
      title: "Export PDF",
      description: "Preview your formatted A4 academic resume and export clean PDF documents.",
      icon: FileCheck,
      href: "/resume-builder"
    }
  ];

  const quickLinks = [
    { title: "Profile", desc: "Identity & skills", icon: User, href: "/profile" },
    { title: "Resume Builder", desc: "Build & preview", icon: FileText, href: "/resume-builder" },
    { title: "Certificates", desc: "Upload & verify", icon: Award, href: "/certificates" },
    { title: "Seminars", desc: "Track workshops", icon: GraduationCap, href: "/seminars" },
    { title: "File Vault", desc: "Document storage", icon: FolderOpen, href: "/file-manager" },
  ];

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Single Primary Hero Banner CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12708c]/15 via-[#0f5c73]/10 to-[#188cae]/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 md:p-8 shadow-xl shadow-[#12708c]/10 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-[#12708c]/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#12708c] to-[#0f5c73] flex items-center justify-center text-white shadow-lg shadow-[#12708c]/25 flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
                {greeting}
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl font-medium">
                Manage your academic identity, preview saved resumes, and export clean PDF documents.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={() => router.push("/resume-builder")} 
              className="gap-2 w-full md:w-auto rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold"
            >
              <Zap className="h-4 w-4" />
              <span>Open Resume Builder</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Previously Created Resumes — Clean Gallery */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Previously Created Resumes</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Horizontal gallery of your saved resume versions</p>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center p-12 border rounded-2xl bg-card/60 backdrop-blur-md">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground font-medium">Loading saved resumes...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="border border-dashed border-border/80 rounded-2xl bg-card/40 backdrop-blur-md p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">No saved resumes yet</h3>
              <p className="text-xs text-muted-foreground max-w-md font-medium">
                You haven't saved any resume snapshots yet. Use the Resume Builder to auto-fill and save your first version.
              </p>
            </div>
          </div>
        ) : (
          /* HORIZONTAL GALLERY */
          <div className="flex overflow-x-auto gap-4 pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-muted">
            {history.map((snapshot, index) => {
              const fields = snapshot.resumeData?.fields || {};
              const eduCount = snapshot.resumeData?.education?.length || 0;
              const projCount = snapshot.resumeData?.projects?.length || 0;
              const certCount = snapshot.resumeData?.certificates?.length || 0;

              return (
                <div
                  key={snapshot.id || index}
                  className="min-w-[290px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start glass-card rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="font-semibold text-xs rounded-lg px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                        {snapshot.label || `Version ${index + 1}`}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={(e) => handleDeleteHistory(snapshot.id, e)}
                        disabled={deletingId === snapshot.id}
                      >
                        {deletingId === snapshot.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <h3 className="text-base font-bold truncate tracking-tight mb-0.5">
                      {fields.name || profile?.name || "Untitled Resume"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-4">
                      <Clock className="h-3 w-3 inline text-primary/70" />
                      <span>{getSnapshotLabel(snapshot.savedAt)}</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mb-4">
                      <span className="px-2.5 py-1 rounded-lg bg-muted/80 backdrop-blur-md font-semibold text-[11px]">
                        {eduCount} Education
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-muted/80 backdrop-blur-md font-semibold text-[11px]">
                        {projCount} Projects
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-muted/80 backdrop-blur-md font-semibold text-[11px]">
                        {certCount} Certs
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 rounded-xl font-semibold border-primary/20 hover:bg-primary/10"
                      onClick={() => router.push(`/resume-builder?snapshotId=${snapshot.id}`)}
                    >
                      <span>View Snapshot</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Workflow Gist */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>Workflow Gist</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">A quick summary of how your academic resume is built and updated</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.step} href={step.href}>
                <div className="glass-card rounded-2xl p-5 h-full flex flex-col justify-between space-y-3 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                      {step.step}
                    </span>
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm tracking-tight">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Navigation Shortcuts */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="glass-card rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">{link.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}