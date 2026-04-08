"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/hooks/useAppState";
import { getSessionUser } from "@/lib/auth";
import { getState, saveState, Profile, ResumeEducationEntry, ResumeProjectEntry, ResumeExpEntry, ResumeAchEntry, ResumeCertEntry } from "@/lib/storage";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Trash2, Loader2, BookOpen, Clock, Download, Zap, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { getHistory, saveSnapshot, deleteSnapshot, restoreSnapshot, type ResumeSnapshot } from "@/lib/resumeHistory";

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, updateState } = useAppState();
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  
  const [resumeFields, setResumeFields] = useState({
    name: "",
    degree_short: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    leetcode: "",
    summary: "",
    prog_langs: "",
    frameworks: "",
    databases: "",
    tools: "",
    softskills: "",
    interests: ""
  });
  
  const [education, setEducation] = useState<ResumeEducationEntry[]>([]);
  const [projects, setProjects] = useState<ResumeProjectEntry[]>([]);
  const [experience, setExperience] = useState<ResumeExpEntry[]>([]);
  const [achievements, setAchievements] = useState<ResumeAchEntry[]>([]);
  const [certificates, setCertificates] = useState<ResumeCertEntry[]>([]);
  
  const [history, setHistory] = useState<ResumeSnapshot[]>([]);
  const [savingVersion, setSavingVersion] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        router.push("/");
        return;
      }
    }
    
    const currentState = getState();
    if (currentState.resumeFields) setResumeFields(currentState.resumeFields);
    if (currentState.resumeEduEntries) setEducation(currentState.resumeEduEntries);
    if (currentState.resumeProjectEntries) setProjects(currentState.resumeProjectEntries);
    if (currentState.resumeExpEntries) setExperience(currentState.resumeExpEntries);
    if (currentState.resumeAchEntries) setAchievements(currentState.resumeAchEntries);
    if (currentState.resumeCertEntries) setCertificates(currentState.resumeCertEntries);
    
    loadHistory();
  }, [user, router]);

  const loadHistory = () => {
    const snapshots = getHistory();
    setHistory(snapshots);
  };

  const handleLogout = () => {
    const { demoLogout } = require("@/lib/auth");
    demoLogout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  const generateFromProfile = () => {
    const profile = state.profile;
    setResumeFields({
      name: profile?.name || "",
      degree_short: profile?.designation || "",
      email: profile?.email || user?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      leetcode: "",
      summary: profile?.bio || "",
      prog_langs: profile?.techskills || "",
      frameworks: profile?.frameworks || "",
      databases: profile?.databases || "",
      tools: profile?.tools || "",
      softskills: profile?.softskills || "",
      interests: ""
    });

    if (profile?.edu) {
      setEducation(profile.edu.map((edu, idx) => ({
        id: Date.now() + idx,
        institution: edu.institution,
        degree: edu.degree,
        branch: edu.branch,
        year: edu.year,
        cgpa: edu.cgpa
      })));
    }

    if (profile?.projects) {
      setProjects(profile.projects.map((proj, idx) => ({
        id: Date.now() + idx,
        title: proj.title,
        tech: proj.tech,
        link: proj.link,
        desc: proj.desc
      })));
    }

    if (state.savedCertificates) {
      setCertificates(state.savedCertificates.map((cert, idx) => ({
        id: Date.now() + idx,
        title: cert.title,
        org: cert.org,
        year: cert.year
      })));
    }

    saveResumeState();
    toast.success("Resume generated from profile!");
  };

  const saveResumeState = () => {
    const resumeState = {
      resumeFields,
      resumeEduEntries: education,
      resumeProjectEntries: projects,
      resumeExpEntries: experience,
      resumeAchEntries: achievements,
      resumeCertEntries: certificates
    };
    saveState(resumeState);
    updateState(resumeState);
  };

  const handleSaveVersion = () => {
    setSavingVersion(true);
    const resumeData = {
      fields: resumeFields,
      education,
      projects,
      experience,
      achievements,
      certificates
    };
    
    const snapshot = saveSnapshot(resumeData as any);
    loadHistory();
    setSavingVersion(false);
    toast.success("Version saved!");
  };

  const handleRestoreSnapshot = async (id: string) => {
    setRestoringId(id);
    const resumeData = restoreSnapshot(id);
    
    if (resumeData) {
      setResumeFields(resumeData.fields);
      setEducation(resumeData.education);
      setProjects(resumeData.projects);
      setExperience(resumeData.experience);
      setAchievements(resumeData.achievements);
      setCertificates(resumeData.certificates);
      saveResumeState();
    }
    
    setRestoringId(null);
    toast.success("Version restored!");
  };

  const handleDeleteSnapshot = (id: string) => {
    deleteSnapshot(id);
    loadHistory();
    toast.success("Version deleted!");
  };

  const exportPDF = () => {
    const preview = document.getElementById("a4-preview");
    if (!preview) {
      toast.error("Nothing to export");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    body { font-family: 'Crimson Text', serif; margin: 0; padding: 20px; }
    .a4-preview { max-width: 210mm; margin: 0 auto; }
    .resume-header { text-align: center; margin-bottom: 20px; }
    .resume-name { font-size: 18pt; font-weight: bold; }
    .resume-contact { font-size: 10pt; color: #666; }
    .resume-section { margin-bottom: 15px; }
    .resume-section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 8px; }
    .resume-entry { margin-bottom: 8px; }
    .resume-entry-title { font-weight: bold; }
    .resume-entry-meta { font-style: italic; font-size: 9pt; }
    .resume-list { margin: 5px 0; padding-left: 20px; }
    .resume-list li { margin-bottom: 2px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>${preview.innerHTML}</body>
</html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const addEntry = (type: "edu" | "proj" | "exp" | "ach" | "cert") => {
    const id = Date.now();
    switch (type) {
      case "edu":
        setEducation([...education, { id }]);
        break;
      case "proj":
        setProjects([...projects, { id }]);
        break;
      case "exp":
        setExperience([...experience, { id }]);
        break;
      case "ach":
        setAchievements([...achievements, { id }]);
        break;
      case "cert":
        setCertificates([...certificates, { id }]);
        break;
    }
  };

  const removeEntry = (type: "edu" | "proj" | "exp" | "ach" | "cert", id: number) => {
    switch (type) {
      case "edu":
        setEducation(education.filter(e => e.id !== id));
        break;
      case "proj":
        setProjects(projects.filter(p => p.id !== id));
        break;
      case "exp":
        setExperience(experience.filter(e => e.id !== id));
        break;
      case "ach":
        setAchievements(achievements.filter(a => a.id !== id));
        break;
      case "cert":
        setCertificates(certificates.filter(c => c.id !== id));
        break;
    }
  };

  const updateEntry = (type: "edu" | "proj" | "exp" | "ach" | "cert", id: number, field: string, value: string) => {
    const updaters = {
      edu: (e: ResumeEducationEntry) => e.id === id && setEducation(education.map(item => item.id === id ? { ...item, [field]: value } : item)),
      proj: (p: ResumeProjectEntry) => p.id === id && setProjects(projects.map(item => item.id === id ? { ...item, [field]: value } : item)),
      exp: (e: ResumeExpEntry) => e.id === id && setExperience(experience.map(item => item.id === id ? { ...item, [field]: value } : item)),
      ach: (a: ResumeAchEntry) => a.id === id && setAchievements(achievements.map(item => item.id === id ? { ...item, [field]: value } : item)),
      cert: (c: ResumeCertEntry) => c.id === id && setCertificates(certificates.map(item => item.id === id ? { ...item, [field]: value } : item))
    };
    updaters[type]({ id, [field]: value } as any);
    saveResumeState();
  };

  if (!user) return null;

  const hasCompletedSeminars = state.seminars?.completed?.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">Create and customize your academic resume</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateFromProfile}>
            <Zap className="mr-2 h-4 w-4" /> Generate from Profile
          </Button>
          <Button variant="secondary" onClick={handleSaveVersion} disabled={savingVersion}>
            {savingVersion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Version
          </Button>
          <Button onClick={exportPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resume History</CardTitle>
                  <CardDescription>Manage saved version snapshots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Saved Versions</h3>
                    <Badge variant="secondary">{history.length} / 4</Badge>
                  </div>
                  
                  {history.length === 0 ? (
                    <EmptyState
                      icon={Clock}
                      heading="No saved versions yet"
                      description="Click 'Save Version' above to snapshot your current resume."
                    />
                  ) : (
                    <div className="space-y-3">
                      {history.map((snapshot) => (
                        <div key={snapshot.id} className={`p-3 border rounded-lg ${restoringId === snapshot.id ? 'ring-2 ring-primary' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{snapshot.label}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(snapshot.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRestoreSnapshot(snapshot.id)}
                              disabled={restoringId === snapshot.id}
                            >
                              {restoringId === snapshot.id && <Loader2 className="w-3 h-3 animate-spin" />}
                              Restore
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteSnapshot(snapshot.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Accordion type="multiple" defaultValue={["personal", "summary"]}>
                <AccordionItem value="personal">
                  <AccordionTrigger>Personal Info</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={resumeFields.name}
                          onChange={(e) => { setResumeFields({ ...resumeFields, name: e.target.value }); saveResumeState(); }}
                          placeholder="Dr. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree / Designation</Label>
                        <Input
                          value={resumeFields.degree_short}
                          onChange={(e) => { setResumeFields({ ...resumeFields, degree_short: e.target.value }); saveResumeState(); }}
                          placeholder="M.Sc. Software Systems"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={resumeFields.email}
                          onChange={(e) => { setResumeFields({ ...resumeFields, email: e.target.value }); saveResumeState(); }}
                          type="email"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={resumeFields.phone}
                          onChange={(e) => { setResumeFields({ ...resumeFields, phone: e.target.value }); saveResumeState(); }}
                          type="tel"
                          placeholder="+91 12345 67890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={resumeFields.location}
                          onChange={(e) => { setResumeFields({ ...resumeFields, location: e.target.value }); saveResumeState(); }}
                          placeholder="Coimbatore, India"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          value={resumeFields.linkedin}
                          onChange={(e) => { setResumeFields({ ...resumeFields, linkedin: e.target.value }); saveResumeState(); }}
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GitHub</Label>
                        <Input
                          value={resumeFields.github}
                          onChange={(e) => { setResumeFields({ ...resumeFields, github: e.target.value }); saveResumeState(); }}
                          placeholder="github.com/johndoe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LeetCode (optional)</Label>
                        <Input
                          value={resumeFields.leetcode}
                          onChange={(e) => { setResumeFields({ ...resumeFields, leetcode: e.target.value }); saveResumeState(); }}
                          placeholder="leetcode.com/u/johndoe"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="summary">
                  <AccordionTrigger>Summary</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Label>Professional Summary</Label>
                      <Textarea
                        value={resumeFields.summary}
                        onChange={(e) => { setResumeFields({ ...resumeFields, summary: e.target.value }); saveResumeState(); }}
                        placeholder="A brief overview of your academic background and expertise..."
                        rows={4}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="education">
                  <AccordionTrigger>Education</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {education.map((edu) => (
                      <Card key={edu.id}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Education Entry</span>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry("edu", edu.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Institution</Label>
                              <Input
                                value={edu.institution || ""}
                                onChange={(e) => updateEntry("edu", edu.id, "institution", e.target.value)}
                                placeholder="University Name"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Degree</Label>
                              <Input
                                value={edu.degree || ""}
                                onChange={(e) => updateEntry("edu", edu.id, "degree", e.target.value)}
                                placeholder="Ph.D. / M.Tech. / B.Tech."
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Field</Label>
                              <Input
                                value={edu.branch || ""}
                                onChange={(e) => updateEntry("edu", edu.id, "branch", e.target.value)}
                                placeholder="Computer Science"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Year</Label>
                              <Input
                                value={edu.year || ""}
                                onChange={(e) => updateEntry("edu", edu.id, "year", e.target.value)}
                                placeholder="2022–2024"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-xs">CGPA</Label>
                              <Input
                                value={edu.cgpa || ""}
                                onChange={(e) => updateEntry("edu", edu.id, "cgpa", e.target.value)}
                                placeholder="9.5 / 95%"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={() => addEntry("edu")} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Education
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skills">
                  <AccordionTrigger>Skills</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Programming Languages</Label>
                      <Input
                        value={resumeFields.prog_langs}
                        onChange={(e) => { setResumeFields({ ...resumeFields, prog_langs: e.target.value }); saveResumeState(); }}
                        placeholder="Python, Java, C++"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frameworks & Libraries</Label>
                      <Input
                        value={resumeFields.frameworks}
                        onChange={(e) => { setResumeFields({ ...resumeFields, frameworks: e.target.value }); saveResumeState(); }}
                        placeholder="React.js, Node.js, TensorFlow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Databases</Label>
                      <Input
                        value={resumeFields.databases}
                        onChange={(e) => { setResumeFields({ ...resumeFields, databases: e.target.value }); saveResumeState(); }}
                        placeholder="MySQL, MongoDB"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Developer Tools</Label>
                      <Input
                        value={resumeFields.tools}
                        onChange={(e) => { setResumeFields({ ...resumeFields, tools: e.target.value }); saveResumeState(); }}
                        placeholder="Git, Docker, VS Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Soft Skills (optional)</Label>
                      <Input
                        value={resumeFields.softskills}
                        onChange={(e) => { setResumeFields({ ...resumeFields, softskills: e.target.value }); saveResumeState(); }}
                        placeholder="Leadership, Communication"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="projects">
                  <AccordionTrigger>Projects</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {projects.map((proj) => (
                      <Card key={proj.id}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Project Entry</span>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry("proj", proj.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Project Title</Label>
                              <Input
                                value={proj.title || ""}
                                onChange={(e) => updateEntry("proj", proj.id, "title", e.target.value)}
                                placeholder="Project Name"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tech Stack</Label>
                              <Input
                                value={proj.tech || ""}
                                onChange={(e) => updateEntry("proj", proj.id, "tech", e.target.value)}
                                placeholder="Python, React, MongoDB"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Link (optional)</Label>
                              <Input
                                value={proj.link || ""}
                                onChange={(e) => updateEntry("proj", proj.id, "link", e.target.value)}
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={proj.desc || ""}
                                onChange={(e) => updateEntry("proj", proj.id, "desc", e.target.value)}
                                placeholder="Bullet points (one per line, start each with •)"
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={() => addEntry("proj")} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experience">
                  <AccordionTrigger>Work Experience</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {experience.map((exp) => (
                      <Card key={exp.id}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Experience Entry</span>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry("exp", exp.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Role</Label>
                                <Input
                                  value={exp.role || ""}
                                  onChange={(e) => updateEntry("exp", exp.id, "role", e.target.value)}
                                  placeholder="Software Engineer"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Organization</Label>
                                <Input
                                  value={exp.org || ""}
                                  onChange={(e) => updateEntry("exp", exp.id, "org", e.target.value)}
                                  placeholder="Company Name"
                                />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <Label className="text-xs">Period</Label>
                                <Input
                                  value={exp.period || ""}
                                  onChange={(e) => updateEntry("exp", exp.id, "period", e.target.value)}
                                  placeholder="01/2024 – 06/2024"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={exp.bullets || ""}
                                onChange={(e) => updateEntry("exp", exp.id, "bullets", e.target.value)}
                                placeholder="Bullet points (one per line, start each with •)"
                                rows={3}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={() => addEntry("exp")} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Experience
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="achievements">
                  <AccordionTrigger>Achievements</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {achievements.map((ach) => (
                      <Card key={ach.id}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Achievement Entry</span>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry("ach", ach.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Position</Label>
                              <Input
                                value={ach.rank || ""}
                                onChange={(e) => updateEntry("ach", ach.id, "rank", e.target.value)}
                                placeholder="1st Place"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Event / Award</Label>
                              <Input
                                value={ach.title || ""}
                                onChange={(e) => updateEntry("ach", ach.id, "title", e.target.value)}
                                placeholder="Hackathon Competition"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-xs">Organized by</Label>
                              <Input
                                value={ach.org || ""}
                                onChange={(e) => updateEntry("ach", ach.id, "org", e.target.value)}
                                placeholder="Event Organizer"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={() => addEntry("ach")} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Add Achievement
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="certificates">
                  <AccordionTrigger>Certifications</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Auto-populated from saved certificates.</p>
                    {certificates.map((cert) => (
                      <Card key={cert.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{cert.title}</p>
                              <p className="text-sm text-muted-foreground">{cert.org} · {cert.year}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeEntry("cert", cert.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="seminars">
                  <AccordionTrigger>
                    Seminars & Workshops
                    <Badge variant="secondary" className="ml-2">auto-synced</Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    {!hasCompletedSeminars ? (
                      <EmptyState
                        icon={GraduationCap}
                        heading="No completed seminars yet"
                        description="Seminars you complete will appear here and sync to your resume."
                      />
                    ) : (
                      <div className="space-y-3">
                        {state.seminars?.completed?.map((seminar, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">{seminar.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {seminar.org && `${seminar.org} · `}
                              {seminar.date && new Date(seminar.date).getFullYear()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="publications">
                  <AccordionTrigger>Publications</AccordionTrigger>
                  <AccordionContent>
                    {state.profile?.publications && state.profile.publications.length > 0 ? (
                      <div className="space-y-3">
                        {state.profile.publications.map((pub, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">{pub.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {pub.authors} · {pub.journal} · {pub.year}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Add publications in your Profile to see them here.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="interests">
                  <AccordionTrigger>Interests</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Label>Interests (comma separated)</Label>
                      <Textarea
                        value={resumeFields.interests}
                        onChange={(e) => { setResumeFields({ ...resumeFields, interests: e.target.value }); saveResumeState(); }}
                        placeholder="Python Scripting, Ethical Hacking, AI Research"
                        rows={2}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="flex justify-center">
            <div
              id="a4-preview"
              className="a4-preview"
              style={{
                width: "210mm",
                minHeight: "297mm",
                background: "#fff",
                color: "#111",
                fontFamily: "Crimson Text, serif",
                fontSize: "10.5pt",
                lineHeight: "1.35",
                padding: "14mm 16mm",
                boxShadow: "0 4px 32px rgba(0,0,0,0.13)",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "18pt", fontWeight: "bold", marginBottom: "3px" }}>
                  {resumeFields.name || "Your Full Name"}
                </div>
                {resumeFields.degree_short && (
                  <div style={{ fontSize: "10pt", marginBottom: "2px" }}>{resumeFields.degree_short}</div>
                )}
                <div style={{ fontSize: "8.5pt", color: "#222", marginBottom: "2px" }}>
                  {resumeFields.location && <span style={{ marginRight: "14px" }}>📍 {resumeFields.location}</span>}
                  {resumeFields.phone && <span style={{ marginRight: "14px" }}>📞 {resumeFields.phone}</span>}
                  {resumeFields.email && <span>✉ {resumeFields.email}</span>}
                </div>
                <div style={{ fontSize: "8.5pt", color: "#222" }}>
                  {resumeFields.linkedin?.includes("linkedin.com/") && (
                    <span style={{ marginRight: "14px" }}>in {resumeFields.linkedin}</span>
                  )}
                  {resumeFields.github?.includes("github.com/") && (
                    <span style={{ marginRight: "14px" }}>⌥ {resumeFields.github}</span>
                  )}
                  {resumeFields.leetcode?.includes("leetcode.com/") && (
                    <span>◈ {resumeFields.leetcode}</span>
                  )}
                </div>
                <hr style={{ border: "none", borderTop: "1.5px solid #111", margin: "5px 0 7px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.13fr", gap: "0 14px" }}>
                {/* Left Column */}
                <div>
                  {resumeFields.summary && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Profile
                      </div>
                      <div style={{ fontSize: "9.5pt" }}>{resumeFields.summary}</div>
                    </div>
                  )}

                  <div style={{ marginBottom: "9px" }}>
                    <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                      Education
                    </div>
                    {education.filter(e => e.institution || e.degree).length > 0 ? (
                      education.filter(e => e.institution || e.degree).map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "4px" }}>
                            <span style={{ fontWeight: "bold", fontSize: "10pt" }}>{edu.institution || "—"}</span>
                            <span style={{ fontSize: "9pt", color: "#333" }}>{edu.year || ""}</span>
                          </div>
                          <div style={{ fontStyle: "italic", fontSize: "9.5pt" }}>
                            {[edu.degree, edu.branch].filter(Boolean).join(", ") || ""}
                          </div>
                          {edu.cgpa && <div style={{ fontSize: "9pt", color: "#333" }}>CGPA: {edu.cgpa}</div>}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontStyle: "italic", fontSize: "9pt", color: "#444" }}>Fill in education above</div>
                    )}
                  </div>

                  <div style={{ marginBottom: "9px" }}>
                    <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                      Projects
                    </div>
                    {projects.filter(p => p.title).length > 0 ? (
                      projects.filter(p => p.title).map((proj, idx) => (
                        <div key={idx} style={{ marginBottom: "7px" }}>
                          <div>
                            <span style={{ fontWeight: "bold", fontSize: "9.5pt" }}>{proj.title}</span>
                            {proj.tech && <span style={{ fontStyle: "italic", fontSize: "9pt", color: "#333" }}> ({proj.tech})</span>}
                          </div>
                          {proj.link && <div style={{ fontSize: "8.5pt", color: "#333" }}>🔗 {proj.link}</div>}
                          {proj.desc && (
                            <ul style={{ margin: "2px 0 0 12px", padding: 0, fontSize: "9.5pt" }}>
                              {proj.desc.split("\n").filter(line => line.trim()).map((line, lineIdx) => (
                                <li key={lineIdx} style={{ marginBottom: "2px" }}>
                                  {line.trim().startsWith("•") ? line.trim().slice(1) : line.trim()}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontStyle: "italic", fontSize: "9pt", color: "#444" }}>Fill in projects above</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                      Skills
                    </div>
                    {[
                      resumeFields.prog_langs && ["Programming Languages", resumeFields.prog_langs],
                      resumeFields.frameworks && ["Frameworks & Libraries", resumeFields.frameworks],
                      resumeFields.databases && ["Databases", resumeFields.databases],
                      resumeFields.tools && ["Developer Tools", resumeFields.tools],
                      resumeFields.softskills && ["Soft Skills", resumeFields.softskills]
                    ].filter(Boolean).map(([cat, val], idx) => (
                      <div key={idx}>
                        <div style={{ fontWeight: "bold", fontSize: "9.5pt" }}>{cat}</div>
                        <div style={{ fontSize: "9.5pt" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {experience.filter(e => e.role || e.org).length > 0 && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Professional Experience
                      </div>
                      {experience.filter(e => e.role || e.org).map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: "7px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "9.5pt" }}>
                            {exp.role || ""}
                            {exp.org && <em> · {exp.org}</em>}
                          </div>
                          {exp.period && <div style={{ fontSize: "9pt", color: "#333" }}>{exp.period}</div>}
                          {exp.bullets && (
                            <ul style={{ margin: "2px 0 0 12px", padding: 0, fontSize: "9.5pt" }}>
                              {exp.bullets.split("\n").filter(line => line.trim()).map((line, lineIdx) => (
                                <li key={lineIdx} style={{ marginBottom: "2px" }}>
                                  {line.trim().startsWith("•") ? line.trim().slice(1) : line.trim()}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {achievements.filter(a => a.rank || a.title).length > 0 && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Achievements
                      </div>
                      {achievements.filter(a => a.rank || a.title).map((ach, idx) => (
                        <div key={idx} style={{ marginBottom: "5px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "9.5pt" }}>
                            {ach.rank && `${ach.rank} | `} {ach.title || ""}
                          </div>
                          {ach.org && <div style={{ fontSize: "9pt", color: "#333" }}>{ach.org}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {certificates.filter(c => c.title).length > 0 && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Certificates
                      </div>
                      {certificates.filter(c => c.title).map((cert, idx) => (
                        <div key={idx} style={{ fontSize: "9.5pt", marginBottom: "3px", display: "flex", gap: "5px" }}>
                          <span style={{ fontWeight: "bold" }}>{cert.title}</span>
                          {cert.org && <span>{cert.org}</span>}
                          {cert.year && <span>({cert.year})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {hasCompletedSeminars && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Seminars & Workshops
                      </div>
                      {state.seminars?.completed?.map((seminar, idx) => (
                        <div key={idx} style={{ fontSize: "9.5pt", marginBottom: "3px", display: "flex", gap: "5px" }}>
                          <span>•</span>
                          <span>
                            <strong>{seminar.title}</strong>
                            {seminar.org && <span> — {seminar.org}</span>}
                            {seminar.date && <span> · {new Date(seminar.date).getFullYear()}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {state.profile?.publications?.length > 0 && (
                    <div style={{ marginBottom: "9px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Publications
                      </div>
                      {state.profile.publications.map((pub, idx) => (
                        <div key={idx} style={{ fontSize: "9.5pt", marginBottom: "3px", display: "flex", gap: "5px" }}>
                          <span>•</span>
                          <span>
                            <strong>{pub.title}</strong>
                            {pub.authors && <span> — {pub.authors}</span>}
                            {pub.journal && <span> — {pub.journal}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeFields.interests && (
                    <div>
                      <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #111", paddingBottom: "1px", marginBottom: "5px" }}>
                        Interests
                      </div>
                      {resumeFields.interests.split(",").map((interest, idx) => (
                        <div key={idx} style={{ fontSize: "9.5pt", marginBottom: "3px", display: "flex", gap: "5px" }}>
                          <span>•</span>
                          <span>{interest.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>This will end your session and redirect you to the login page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}