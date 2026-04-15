"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useAppState";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, User, FileText, Award, GraduationCap, FolderOpen, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleGetAiFeedback = async () => {
    setIsLoadingAi(true);
    try {
      const response = await api.post<{ feedback: string }>("/api/ai/profile-feedback", profile);
      setAiFeedback(response.feedback);
      toast.success("AI feedback generated!");
    } catch (err) {
      toast.error("Failed to get AI feedback");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Time-based greeting
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const firstName = profile?.name || user?.name || "";
  const greeting = firstName ? `Good ${timeOfDay}, ${firstName.split(" ")[0]}!` : `Good ${timeOfDay}!`;

  const infoCards = [
    {
      icon: User,
      name: "Profile",
      href: "/profile",
      description: "Your central academic identity. Fill this first — all other sections pull data from here.",
      steps: [
        "Enter your name, phone, location & LinkedIn URL",
        "Write a short bio / professional summary",
        "Add education entries (institution, degree, CGPA)",
        "List your technical skills, tools & soft skills",
        "Add projects with description & tech stack",
        "Click Save Profile when done",
      ],
    },
    {
      icon: FileText,
      name: "Resume Builder",
      href: "/resume-builder",
      description: "Build a clean A4 resume with a live preview. Generate from profile or edit manually.",
      steps: [
        "Click ⚡ Generate from Profile to auto-fill",
        "Fine-tune each section using the accordions",
        "Seminars auto-populate once you complete them",
        "Preview updates live on the right panel",
        "Click Export Resume as PDF to download",
      ],
    },
    {
      icon: Award,
      name: "Certificates",
      href: "/certificates",
      description: "Upload certificate images or PDFs — data is auto-extracted and saved to your profile & resume.",
      steps: [
        "Click the upload zone or drag & drop a file",
        "Supported formats: PDF, PNG, JPG",
        "Review the auto-extracted title, org & year",
        "Edit any fields if extraction was inaccurate",
        "Click Confirm & Save to add to your profile",
        "Saved certificates appear in your resume automatically",
      ],
    },
    {
      icon: GraduationCap,
      name: "Seminars",
      href: "/seminars",
      description: "Track seminars & workshops. Completed ones auto-populate your resume — no manual entry needed.",
      steps: [
        "Go to the On Queue tab and click + Add Seminar",
        "Enter title, organizer, date & optional notes",
        "Past dates auto-move to Completed and add to resume",
        "Upcoming seminars stay in queue until their date",
        "Mark any queued seminar complete manually anytime",
      ],
    },
    {
      icon: FolderOpen,
      name: "File Manager",
      href: "/file-manager",
      description: "A central place to keep all your documents — certificates, transcripts, project files, etc.",
      steps: [
        "Click ⬆ Upload File to add any document",
        "Files are listed with name, type & upload date",
        "Delete any file using the Delete button",
        "Use this as a personal document vault for your records",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Card */}
      <Link href="/profile">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👋</span>
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-bold mb-1">{greeting}</h2>
                <p className="text-muted-foreground mb-3">Your academic resume workspace is ready.</p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  ✏ View & edit your profile →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* AI Feedback Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Profile Feedback</CardTitle>
                <CardDescription>Get personalized suggestions to improve your profile</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleGetAiFeedback}
              disabled={isLoadingAi}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoadingAi ? "Generating..." : "Get AI Feedback"}
            </Button>
          </div>
        </CardHeader>
        {aiFeedback && (
          <CardContent>
            <div className="bg-white/50 rounded-lg p-4 text-sm whitespace-pre-line">
              {aiFeedback}
            </div>
          </CardContent>
        )}
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>🗺 How this app works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary" className="font-normal">
              1️⃣ Fill Profile
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-normal">
              📄 Build Resume
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-normal">
              🏅 Add Certificates
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-normal">
              🎓 Log Seminars
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="font-normal">
              ⬇ Export PDF
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section Guide Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">📌 What to do in each section</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{card.name}</CardTitle>
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {card.steps.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Navigation Tips */}
      <Card>
        <CardHeader>
          <CardTitle>🧭 Navigation tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 items-start">
            <Badge>☰</Badge>
            <p className="text-sm text-muted-foreground">
              Use the <strong>hamburger menu</strong> (top-left) on any page to open the sidebar and navigate between sections.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <Badge>💾</Badge>
            <p className="text-sm text-muted-foreground">
              Your data is saved in your browser session. Always <strong>Save Profile</strong> before leaving the Profile page.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <Badge>⚡</Badge>
            <p className="text-sm text-muted-foreground">
              In the Resume Builder, use <strong>Generate from Profile</strong> to auto-populate everything with one click.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <Badge>🔄</Badge>
            <p className="text-sm text-muted-foreground">
              Seminars and Certificates <strong>sync automatically</strong> to your resume — no manual copy-paste needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}