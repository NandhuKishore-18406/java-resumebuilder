"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/hooks/useAppState";
import { getSessionUser } from "@/lib/auth";
import { getState, saveState, Education, Project, Profile, Experience, Publication } from "@/lib/storage";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon, Plus, Trash2, X, Loader2, BookOpen, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, updateState } = useAppState();
  const [unsaved, setUnsaved] = useState(false);
  
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [awards, setAwards] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  
  const [skillInput, setSkillInput] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [awardInput, setAwardInput] = useState("");
  
  const [eduDialogOpen, setEduDialogOpen] = useState(false);
  const [expDialogOpen, setExpDialogOpen] = useState(false);
  const [projDialogOpen, setProjDialogOpen] = useState(false);
  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingProj, setEditingProj] = useState<Project | null>(null);

  const [eduDateRange, setEduDateRange] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(undefined);
  const [expDateRange, setExpDateRange] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(undefined);
  
  const [newEdu, setNewEdu] = useState<Partial<Education>>({});
  const [newExp, setNewExp] = useState<Partial<Experience>>({ id: 0, role: "", company: "", description: "" } as Experience);
  const [newProj, setNewProj] = useState<Partial<Project>>({});
  const [newPub, setNewPub] = useState<Partial<Publication>>({ id: 0, title: "", journal: "", year: "", authors: "" } as Publication);
  
  const [orcidLoading, setorcidLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        router.push("/");
        return;
      }
    }

    getState().then(currentState => {
      if (currentState.profile) {
        setProfile(currentState.profile);
        setTechSkills(currentState.profile.techskills?.split(", ").filter(Boolean) || []);
        setTools(currentState.profile.tools?.split(", ").filter(Boolean) || []);
        setSoftSkills(currentState.profile.softskills?.split(", ").filter(Boolean) || []);
        if (currentState.profile.edu) setEducation(currentState.profile.edu);
        if (currentState.profile.projects) setProjects(currentState.profile.projects);
        if (currentState.profile.experience) setExperience(currentState.profile.experience);
        if (currentState.profile.publications) setPublications(currentState.profile.publications);
        if (currentState.profile.languages) setLanguages(currentState.profile.languages);
        if (currentState.profile.awards) setAwards(currentState.profile.awards);
      }
      if (currentState.savedCertificates) {
        setProfile(prev => ({ ...prev, certificatesCount: currentState.savedCertificates.length }));
      }
      if (currentState.seminars?.completed) {
        setProfile(prev => ({ ...prev, seminarsCount: currentState.seminars.completed.length }));
      }
    });
  }, [user, router]);

  const handleLogout = () => {
    const { demoLogout } = require("@/lib/auth");
    demoLogout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  const addSkill = (skill: string, type: "tech" | "tool" | "soft") => {
    if (!skill.trim()) return;
    const trimmed = skill.trim();
    if (type === "tech" && !techSkills.includes(trimmed)) setTechSkills([...techSkills, trimmed]);
    if (type === "tool" && !tools.includes(trimmed)) setTools([...tools, trimmed]);
    if (type === "soft" && !softSkills.includes(trimmed)) setSoftSkills([...softSkills, trimmed]);
    setUnsaved(true);
  };

  const removeSkill = (skill: string, type: "tech" | "tool" | "soft") => {
    if (type === "tech") setTechSkills(techSkills.filter(s => s !== skill));
    if (type === "tool") setTools(tools.filter(s => s !== skill));
    if (type === "soft") setSoftSkills(softSkills.filter(s => s !== skill));
    setUnsaved(true);
  };

  const addLanguage = (lang: string) => {
    if (!lang.trim() || languages.includes(lang.trim())) return;
    setLanguages([...languages, lang.trim()]);
    setLanguageInput("");
    setUnsaved(true);
  };

  const addAward = (award: string) => {
    if (!award.trim()) return;
    setAwards([...awards, award.trim()]);
    setAwardInput("");
    setUnsaved(true);
  };

  const saveEducation = () => {
    const eduEntry: Education = {
      ...newEdu,
      year: eduDateRange?.from && eduDateRange.to ? `${format(eduDateRange.from, "MMM yyyy")} – ${format(eduDateRange.to, "MMM yyyy")}` : ""
    } as Education;

    if (editingEdu) {
      setEducation(education.map(e => e === editingEdu ? eduEntry : e));
    } else {
      setEducation([...education, eduEntry]);
    }
    setEduDialogOpen(false);
    setNewEdu({});
    setEditingEdu(null);
    setEduDateRange(undefined);
    setUnsaved(true);
    toast.success(editingEdu ? "Education updated" : "Education added");
  };

  const deleteEducation = (edu: Education) => {
    setEducation(education.filter(e => e !== edu));
    setUnsaved(true);
    toast.success("Education deleted");
  };

  const saveExperience = () => {
    const expEntry: Experience = {
      ...newExp,
      id: newExp.id || Date.now(),
      period: expDateRange?.from && expDateRange.to ? `${format(expDateRange.from, "MMM yyyy")} – ${format(expDateRange.to, "MMM yyyy")}` : ""
    } as Experience;

    if (editingExp) {
      setExperience(experience.map(e => e.id === editingExp.id ? expEntry : e));
    } else {
      setExperience([...experience, expEntry]);
    }
    setExpDialogOpen(false);
    setNewExp({ id: 0, role: "", company: "", description: "" } as Experience);
    setEditingExp(null);
    setExpDateRange(undefined);
    setUnsaved(true);
    toast.success(editingExp ? "Experience updated" : "Experience added");
  };

  const deleteExperience = (exp: Experience) => {
    setExperience(experience.filter(e => e.id !== exp.id));
    setUnsaved(true);
    toast.success("Experience deleted");
  };

  const saveProject = () => {
    const projEntry: Project = {
      ...newProj,
      tech: newProj.tech?.split(", ").filter(Boolean).join(", ")
    } as Project;

    if (editingProj) {
      setProjects(projects.map(p => p === editingProj ? projEntry : p));
    } else {
      setProjects([...projects, projEntry]);
    }
    setProjDialogOpen(false);
    setNewProj({});
    setEditingProj(null);
    setUnsaved(true);
    toast.success(editingProj ? "Project updated" : "Project added");
  };

  const deleteProject = (proj: Project) => {
    setProjects(projects.filter(p => p !== proj));
    setUnsaved(true);
    toast.success("Project deleted");
  };

  const syncORCID = () => {
    setorcidLoading(true);
    setTimeout(() => {
      setPublications([
        { id: 1, title: "Machine Learning Approaches for Academic Resume Generation", journal: "IEEE Transactions on Education", year: "2024", authors: "Demo User, et al." },
        { id: 2, title: "Automated Profile Management Systems", journal: "ACM SIGCSE", year: "2023", authors: "Demo User" }
      ]);
      setorcidLoading(false);
      toast.success("Publications synced from ORCID!");
    }, 1500);
  };

  const savePublication = () => {
    const pubEntry: Publication = {
      id: Date.now(),
      ...newPub
    } as Publication;
    setPublications([...publications, pubEntry]);
    setPubDialogOpen(false);
    setNewPub({ id: 0, title: "", journal: "", year: "", authors: "" } as Publication);
    setUnsaved(true);
    toast.success("Publication added");
  };

  const deletePublication = (pub: Publication) => {
    setPublications(publications.filter(p => p.id !== pub.id));
    setUnsaved(true);
    toast.success("Publication deleted");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    
    const updatedProfile: Profile = {
      ...profile,
      techskills: techSkills.join(", "),
      tools: tools.join(", "),
      softskills: softSkills.join(", "),
      edu: education,
      projects,
      experience,
      publications,
      languages,
      awards
    } as Profile;

    saveState({ profile: updatedProfile });
    updateState({ profile: updatedProfile });
    setUnsaved(false);
    setSaving(false);
    toast.success("Profile saved successfully!");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your academic and professional information</p>
        </div>
        <div className="flex items-center gap-2">
          {unsaved && <div className="h-2 w-2 rounded-full bg-orange-500" />}
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="bio">Bio & Skills</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="more">More</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name || ""}
                    onChange={(e) => { setProfile({ ...profile, name: e.target.value }); setUnsaved(true); }}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={profile.email || user?.email || ""}
                    onChange={(e) => { setProfile({ ...profile, email: e.target.value }); setUnsaved(true); }}
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) => { setProfile({ ...profile, phone: e.target.value }); setUnsaved(true); }}
                    type="tel"
                    placeholder="+91 12345 67890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={profile.location || ""}
                    onChange={(e) => { setProfile({ ...profile, location: e.target.value }); setUnsaved(true); }}
                    placeholder="Coimbatore, India"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={profile.linkedin || ""}
                    onChange={(e) => { setProfile({ ...profile, linkedin: e.target.value }); setUnsaved(true); }}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website / Portfolio</Label>
                  <Input
                    value={profile.url || ""}
                    onChange={(e) => { setProfile({ ...profile, url: e.target.value }); setUnsaved(true); }}
                    placeholder="https://johndoe.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input
                    value={profile.designation || ""}
                    onChange={(e) => { setProfile({ ...profile, designation: e.target.value }); setUnsaved(true); }}
                    placeholder="Professor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={profile.department || ""}
                    onChange={(e) => { setProfile({ ...profile, department: e.target.value }); setUnsaved(true); }}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input
                    value={profile.institution || ""}
                    onChange={(e) => { setProfile({ ...profile, institution: e.target.value }); setUnsaved(true); }}
                    placeholder="University Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vidwan ID</Label>
                  <Input
                    value={profile.vidwanId || ""}
                    onChange={(e) => { setProfile({ ...profile, vidwanId: e.target.value }); setUnsaved(true); }}
                    placeholder="V123456"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>ORCID ID</Label>
                  <Input
                    value={profile.orcidId || ""}
                    onChange={(e) => { setProfile({ ...profile, orcidId: e.target.value }); setUnsaved(true); }}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bio & Skills</CardTitle>
              <CardDescription>Your professional summary and skill sets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea
                  value={profile.bio || ""}
                  onChange={(e) => { setProfile({ ...profile, bio: e.target.value }); setUnsaved(true); }}
                  placeholder="A brief overview of your academic background and research interests..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Technical Skills</Label>
                <div className="flex gap-2 flex-wrap">
                  {techSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill, "tech")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (addSkill(skillInput, "tech"), setSkillInput(""))}
                    placeholder="Add a skill (press Enter)"
                  />
                  <Button type="button" variant="outline" onClick={() => { addSkill(skillInput, "tech"); setSkillInput(""); }}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tools & Technologies</Label>
                <div className="flex gap-2 flex-wrap">
                  {tools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="gap-1">
                      {tool}
                      <button onClick={() => removeSkill(tool, "tool")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (addSkill(toolInput, "tool"), setToolInput(""))}
                    placeholder="Add a tool (press Enter)"
                  />
                  <Button type="button" variant="outline" onClick={() => { addSkill(toolInput, "tool"); setToolInput(""); }}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Soft Skills</Label>
                <div className="flex gap-2 flex-wrap">
                  {softSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button onClick={() => removeSkill(skill, "soft")} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (addSkill(softSkillInput, "soft"), setSoftSkillInput(""))}
                    placeholder="Add a skill (press Enter)"
                  />
                  <Button type="button" variant="outline" onClick={() => { addSkill(softSkillInput, "soft"); setSoftSkillInput(""); }}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your academic qualifications</CardDescription>
                </div>
                <Dialog open={eduDialogOpen} onOpenChange={setEduDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setNewEdu({}); setEditingEdu(null); setEduDateRange(undefined); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Education
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingEdu ? "Edit Education" : "Add Education"}</DialogTitle>
                      <DialogDescription>Enter your educational qualification details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={newEdu.institution || ""}
                          onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                          placeholder="University Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input
                            value={newEdu.degree || ""}
                            onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                            placeholder="Ph.D. / M.Tech. / B.Tech."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field/Specialization</Label>
                          <Input
                            value={newEdu.branch || ""}
                            onChange={(e) => setNewEdu({ ...newEdu, branch: e.target.value })}
                            placeholder="Computer Science"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {eduDateRange?.from
                                ? eduDateRange.to
                                  ? `${format(eduDateRange.from, "MMM yyyy")} → ${format(eduDateRange.to, "MMM yyyy")}`
                                  : format(eduDateRange.from, "MMM yyyy")
                                : "Pick date range"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={eduDateRange}
                              onSelect={(range) => setEduDateRange(range ? { from: range.from || undefined, to: range.to || undefined } : undefined)}
                              numberOfMonths={2}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA / Percentage</Label>
                        <Input
                          value={newEdu.cgpa || ""}
                          onChange={(e) => setNewEdu({ ...newEdu, cgpa: e.target.value })}
                          placeholder="9.5 / 95%"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEduDialogOpen(false)}>Cancel</Button>
                      <Button onClick={saveEducation}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {education.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No education entries yet. Click "Add Education" to get started.</div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{edu.institution}</h3>
                            <p className="text-muted-foreground">{edu.degree} {edu.branch && `in ${edu.branch}`}</p>
                            <p className="text-sm text-muted-foreground">{edu.year} {edu.cgpa && `· CGPA: ${edu.cgpa}`}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setNewEdu(edu); setEditingEdu(edu); setEduDialogOpen(true); }}>
                              <Loader2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteEducation(edu)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Experience</CardTitle>
                  <CardDescription>Your professional work experience</CardDescription>
                </div>
                <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setNewExp({ id: 0, role: "", company: "", description: "" } as Experience); setEditingExp(null); setExpDateRange(undefined); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Experience
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingExp ? "Edit Experience" : "Add Experience"}</DialogTitle>
                      <DialogDescription>Enter your work experience details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Role / Position</Label>
                        <Input
                          value={newExp.role || ""}
                          onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                          placeholder="Senior Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company / Organization</Label>
                        <Input
                          value={newExp.company || ""}
                          onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {expDateRange?.from
                                ? expDateRange.to
                                  ? `${format(expDateRange.from, "MMM yyyy")} → ${format(expDateRange.to, "MMM yyyy")}`
                                  : format(expDateRange.from, "MMM yyyy")
                                : "Pick date range"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={expDateRange}
                              onSelect={(range) => setExpDateRange(range ? { from: range.from || undefined, to: range.to || undefined } : undefined)}
                              numberOfMonths={2}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newExp.description || ""}
                          onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setExpDialogOpen(false)}>Cancel</Button>
                      <Button onClick={saveExperience}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {experience.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No experience entries yet. Click "Add Experience" to get started.</div>
              ) : (
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{exp.role}</h3>
                            <p className="text-muted-foreground">{exp.company}</p>
                            <p className="text-sm text-muted-foreground">{exp.period}</p>
                            {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setNewExp(exp); setEditingExp(exp); setExpDialogOpen(true); }}>
                              <Loader2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Your academic and personal projects</CardDescription>
                </div>
                <Dialog open={projDialogOpen} onOpenChange={setProjDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setNewProj({}); setEditingProj(null); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProj ? "Edit Project" : "Add Project"}</DialogTitle>
                      <DialogDescription>Enter your project details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input
                          value={newProj.title || ""}
                          onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                          placeholder="Project Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tech Stack (comma separated)</Label>
                        <Input
                          value={newProj.tech || ""}
                          onChange={(e) => setNewProj({ ...newProj, tech: e.target.value })}
                          placeholder="Python, TensorFlow, React"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newProj.desc || ""}
                          onChange={(e) => setNewProj({ ...newProj, desc: e.target.value })}
                          placeholder="Describe your project..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Project Link</Label>
                        <Input
                          value={newProj.link || ""}
                          onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setProjDialogOpen(false)}>Cancel</Button>
                      <Button onClick={saveProject}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No projects yet. Click "Add Project" to get started.</div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{proj.title}</h3>
                            {proj.tech && <p className="text-sm text-muted-foreground">{proj.tech}</p>}
                            {proj.desc && <p className="text-sm mt-2">{proj.desc}</p>}
                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{proj.link}</a>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setNewProj(proj); setEditingProj(proj); setProjDialogOpen(true); }}>
                              <Loader2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteProject(proj)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Publications</CardTitle>
                  <CardDescription>Your research publications and papers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={syncORCID} disabled={orcidLoading}>
                    {orcidLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sync from ORCID
                  </Button>
                  <Dialog open={pubDialogOpen} onOpenChange={setPubDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewPub({ id: 0, title: "", journal: "", year: "", authors: "" } as Publication)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Manual
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Publication</DialogTitle>
                        <DialogDescription>Enter your publication details manually</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={newPub.title || ""}
                            onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
                            placeholder="Paper Title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Journal / Conference</Label>
                          <Input
                            value={newPub.journal || ""}
                            onChange={(e) => setNewPub({ ...newPub, journal: e.target.value })}
                            placeholder="Journal Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            value={newPub.year || ""}
                            onChange={(e) => setNewPub({ ...newPub, year: e.target.value })}
                            placeholder="2024"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Authors</Label>
                          <Input
                            value={newPub.authors || ""}
                            onChange={(e) => setNewPub({ ...newPub, authors: e.target.value })}
                            placeholder="Author names"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPubDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePublication}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {publications.length === 0 ? (
                <div className="py-16 px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 mx-auto">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No publications synced</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4 mx-auto">Enter your ORCID ID and click Sync, or add publications manually.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{pub.title}</h3>
                            <p className="text-muted-foreground">{pub.authors}</p>
                            <p className="text-sm text-muted-foreground">{pub.journal} · {pub.year}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deletePublication(pub)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="more" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Awards</CardTitle>
                <CardDescription>Your achievements and recognitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {awards.map((award, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>{award}</span>
                      <Button variant="ghost" size="icon" onClick={() => setAwards(awards.filter((_, i) => i !== idx))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={awardInput}
                      onChange={(e) => setAwardInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAward(awardInput)}
                      placeholder="Add award (press Enter)"
                    />
                    <Button type="button" variant="outline" onClick={() => addAward(awardInput)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you know</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="gap-1">
                        {lang}
                        <button onClick={() => setLanguages(languages.filter(l => l !== lang))} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addLanguage(languageInput)}
                      placeholder="Add language (press Enter)"
                    />
                    <Button type="button" variant="outline" onClick={() => addLanguage(languageInput)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Certificates</CardTitle>
                <CardDescription>Certificates uploaded via Certificates page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-primary">{profile.certificatesCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <a href="/certificates" className="text-blue-600 hover:underline">Manage certificates →</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Seminars</CardTitle>
                <CardDescription>Seminars completed via Seminars page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-primary">{profile.seminarsCount || 0}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <a href="/seminars" className="text-blue-600 hover:underline">Manage seminars →</a>
                  </p>
                </div>
              </CardContent>
            </Card>
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