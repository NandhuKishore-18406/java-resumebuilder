"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useAppState";
import { 
  generatePortfolioHtml, 
  generateSingleStandaloneHtml, 
  CSS_TEMPLATE, 
  JS_TEMPLATE, 
  type PortfolioData,
  type PortfolioSkillItem,
  type PortfolioProject
} from "@/lib/pyportfolioEngine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Sparkles, 
  Download, 
  FileCode, 
  ExternalLink, 
  Check, 
  Code, 
  Layers, 
  User,
  Loader2,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/lib/auth";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [tagline, setTagline] = useState("");
  const [aboutBio, setAboutBio] = useState("");
  const [heroImage, setHeroImage] = useState(
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2000&auto=format&fit=crop"
  );
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (profile) {
      setTagline(profile.designation || "Systems Programmer • Full Stack Developer");
      setAboutBio(
        profile.bio || 
        "Building low-level systems, backend services, and interactive web applications with clean engineering."
      );
    }
  }, [profile]);

  const buildPortfolioData = (): PortfolioData => {
    const parseList = (str?: string): PortfolioSkillItem[] => {
      if (!str) return [];
      return str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          name,
          level: Math.max(65, 95 - i * 4)
        }));
    };

    const skills: Record<string, PortfolioSkillItem[]> = {};

    if (profile?.techskills) skills["Languages"] = parseList(profile.techskills);
    if (profile?.frameworks) skills["Frameworks"] = parseList(profile.frameworks);
    if (profile?.databases) skills["Databases"] = parseList(profile.databases);
    if (profile?.tools) skills["Tools"] = parseList(profile.tools);

    if (Object.keys(skills).length === 0) {
      skills["Languages"] = [
        { name: "Java", level: 90 },
        { name: "TypeScript", level: 85 },
        { name: "SQL", level: 80 }
      ];
      skills["Frameworks"] = [
        { name: "Spring Boot", level: 88 },
        { name: "Next.js", level: 82 }
      ];
    }

    const rawProjects = Array.isArray(profile?.projects) ? profile.projects : [];
    const projects: PortfolioProject[] = rawProjects.map((p) => ({
      title: p.title || "Project",
      description: p.desc || p.tech || "Full-stack application.",
      github: p.link || profile?.github || "",
      live: p.link || "",
      images: [heroImage]
    }));

    if (projects.length === 0) {
      projects.push({
        title: "Academic Resume & Portfolio Platform",
        description: "Automated profile, resume generation, and web portfolio platform built with Spring Boot & Next.js.",
        github: profile?.github || "https://github.com",
        live: "http://localhost:3000",
        images: [heroImage]
      });
    }

    const contact: Record<string, string> = {};
    if (profile?.email || user?.email) contact["email"] = profile?.email || user?.email || "";
    if (profile?.github) contact["github"] = profile.github;
    if (profile?.linkedin) contact["linkedin"] = profile.linkedin;
    if (profile?.phone) contact["phone"] = profile.phone;

    return {
      name: profile?.name || user?.name || "Developer Portfolio",
      tagline: tagline || "Software Engineer",
      about: aboutBio || profile?.bio || "Building modern digital experiences.",
      hero_image: heroImage,
      skills,
      projects,
      contact
    };
  };

  const handleGeneratePortfolio = () => {
    const data = buildPortfolioData();
    const html = generateSingleStandaloneHtml(data);
    setGeneratedHtml(html);

    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
    toast.success("Portfolio website created successfully!");
  };

  const handleDownloadStandaloneHtml = () => {
    const data = buildPortfolioData();
    const htmlContent = generateSingleStandaloneHtml(data);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile?.name || "portfolio").toLowerCase().replace(/\s+/g, "_")}_portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded standalone portfolio HTML!");
  };

  const handleDownloadZipBundle = async () => {
    setDownloadingZip(true);
    try {
      const data = buildPortfolioData();
      const rawHtml = generatePortfolioHtml(data);

      const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(`${BASE}/api/portfolio/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          html: rawHtml,
          css: CSS_TEMPLATE,
          js: JS_TEMPLATE
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate zip on server");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pyportfolio_bundle.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded PyPortfolio .zip package!");
    } catch {
      // Fallback client single download
      handleDownloadStandaloneHtml();
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <span>PyPortfolio Generator</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Turn your profile details into a cinematic, interactive personal portfolio website.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <Button onClick={handleGeneratePortfolio} className="gap-2 rounded-xl shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Generate Portfolio</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadStandaloneHtml} 
            className="gap-2 rounded-xl bg-background/60 border-primary/20"
          >
            <FileCode className="h-4 w-4" />
            <span>Download HTML</span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleDownloadZipBundle} 
            disabled={downloadingZip} 
            className="gap-2 rounded-xl"
          >
            {downloadingZip ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Download .ZIP</span>
          </Button>
        </div>
      </div>

      {/* Control Form Card */}
      <Card className="glass-card rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>Portfolio Customization & Collected Data</span>
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Edit tagline, bio, and background image before generating your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-xs font-semibold">Hero Tagline</Label>
              <Input
                id="tagline"
                placeholder="Systems Programmer • Full Stack Developer"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImage" className="text-xs font-semibold">Hero Background Image URL</Label>
              <Input
                id="heroImage"
                placeholder="https://images.unsplash.com/..."
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutBio" className="text-xs font-semibold">About / Professional Bio</Label>
            <Textarea
              id="aboutBio"
              rows={3}
              placeholder="Describe your technical background..."
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground font-medium">
            <Badge variant="outline" className="gap-1 rounded-lg">
              <User className="h-3 w-3 text-primary" />
              <span>Name: {profile?.name || user?.name || "Default"}</span>
            </Badge>
            <Badge variant="outline" className="gap-1 rounded-lg">
              <Code className="h-3 w-3 text-primary" />
              <span>Skills: {profile?.techskills || "Languages"}</span>
            </Badge>
            <Badge variant="outline" className="gap-1 rounded-lg">
              <Layers className="h-3 w-3 text-primary" />
              <span>Projects: {Array.isArray(profile?.projects) ? profile.projects.length : 0} Entries</span>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Live Fullscreen Interactive Website Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            <span>Interactive Website Preview</span>
          </h2>
          {generatedHtml && (
            <Badge variant="secondary" className="gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
              <Check className="h-3 w-3 text-green-600" />
              <span>Website Compiled</span>
            </Badge>
          )}
        </div>

        <div className="border border-border/80 rounded-2xl overflow-hidden bg-black shadow-xl h-[650px] relative">
          {!generatedHtml ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card/60 backdrop-blur-md">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-1">Portfolio Preview Ready</h3>
              <p className="text-xs text-muted-foreground max-w-md font-medium mb-4">
                Click <strong>Generate Portfolio</strong> above to render a live, cinematic interactive website preview.
              </p>
              <Button onClick={handleGeneratePortfolio} className="gap-2 rounded-xl font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Generate Portfolio Now</span>
              </Button>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              title="PyPortfolio Live Preview"
              className="w-full h-full border-none"
              srcDoc={generatedHtml}
            />
          )}
        </div>
      </section>
    </div>
  );
}
