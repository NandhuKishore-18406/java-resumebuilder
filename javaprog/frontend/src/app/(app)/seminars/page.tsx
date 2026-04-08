"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppState } from "@/hooks/useAppState";
import { toast } from "sonner";
import { GraduationCap, CalendarClock, Plus, X, Check, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function SeminarsPage() {
  const { state, updateState } = useAppState();
  const { seminars } = state;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    org: "",
    date: undefined as Date | undefined,
    notes: "",
  });

  useEffect(() => {
    checkSeminarDates();
  }, []);

  const checkSeminarDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toMove = seminars.queue.filter((s) => {
      if (!s.date) return false;
      const seminarDate = new Date(s.date);
      seminarDate.setHours(0, 0, 0, 0);
      return seminarDate <= today;
    });
    if (toMove.length > 0) {
      const newQueue = seminars.queue.filter((s) => !toMove.find((m) => m.id === s.id));
      const newCompleted = [...seminars.completed, ...toMove];
      updateState({ seminars: { completed: newCompleted, queue: newQueue } });
      toast.success(`${toMove.length} seminar${toMove.length > 1 ? "s" : ""} auto-moved to Completed`);
    }
  };

  const handleSaveSeminar = () => {
    if (!formData.title.trim()) { toast.error("Please enter a seminar title"); return; }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = formData.date && formData.date <= today;
    const newSeminar = {
      id: Date.now(),
      title: formData.title.trim(),
      org: formData.org.trim(),
      date: formData.date ? format(formData.date, "yyyy-MM-dd") : undefined,
      notes: formData.notes.trim(),
    };
    if (isPast) {
      updateState({ seminars: { completed: [...seminars.completed, newSeminar], queue: seminars.queue } });
      toast.success("Seminar completed — added to resume automatically!");
    } else {
      updateState({ seminars: { completed: seminars.completed, queue: [...seminars.queue, newSeminar] } });
      toast.success("Seminar added to queue");
    }
    setFormData({ title: "", org: "", date: undefined, notes: "" });
    setShowAddForm(false);
  };

  const handleMarkComplete = (id: number) => {
    const seminar = seminars.queue.find((s) => s.id === id);
    if (!seminar) return;
    updateState({
      seminars: {
        completed: [...seminars.completed, { ...seminar, date: seminar.date || format(new Date(), "yyyy-MM-dd") }],
        queue: seminars.queue.filter((s) => s.id !== id),
      },
    });
    toast.success(`"${seminar.title}" completed — added to resume!`);
  };

  const handleDeleteSeminar = (type: "completed" | "queue", id: number) => {
    if (type === "completed") {
      updateState({ seminars: { completed: seminars.completed.filter((s) => s.id !== id), queue: seminars.queue } });
    } else {
      updateState({ seminars: { completed: seminars.completed, queue: seminars.queue.filter((s) => s.id !== id) } });
    }
    toast.success("Seminar deleted");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Seminars</h1>
        <p className="text-muted-foreground">Add upcoming seminars. When completed they auto-populate your resume and profile.</p>
      </div>
      <Tabs defaultValue="completed">
        <TabsList>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="queue">On Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="completed" className="space-y-4">
          {seminars.completed.length === 0 ? (
            <EmptyState icon={GraduationCap} heading="No completed seminars yet" description="Seminars you complete will appear here and sync to your resume." />
          ) : (
            <div className="grid gap-3">
              {seminars.completed.map((seminar) => (
                <Card key={seminar.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{seminar.title}</p>
                        <p className="text-sm text-muted-foreground">{seminar.org && `${seminar.org} · `}{formatDate(seminar.date)}</p>
                        {seminar.notes && <p className="text-sm mt-2 italic text-muted-foreground">{seminar.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">✓ In Resume</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSeminar("completed", seminar.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="queue" className="space-y-4">
          <Button onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-2" />Add Seminar</Button>
          {showAddForm && (
            <Card><CardContent className="p-6">
              <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">New Seminar</h3><Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}><X className="h-4 w-4" /></Button></div>
              <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="title">Seminar Title</Label><Input id="title" placeholder="Enter seminar title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="org">Organizer / Institution</Label><Input id="org" placeholder="Organizer name" value={formData.org} onChange={(e) => setFormData({ ...formData, org: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Date</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}><CalendarClock className="h-4 w-4 mr-2" />{formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData({ ...formData, date })} initialFocus /></PopoverContent></Popover>
                    {formData.date && <p className="text-xs text-muted-foreground">{formData.date <= new Date() ? "Past date = auto-moved to Completed + added to Resume" : "Upcoming date = stays in queue"}</p>}
                  </div>
                </div>
                <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" placeholder="Notes or description..." rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
                <div className="flex gap-3 pt-2"><Button onClick={handleSaveSeminar}>Save</Button><Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button></div>
              </div>
            </CardContent></Card>
          )}
          {seminars.queue.length === 0 && !showAddForm ? (
            <EmptyState icon={CalendarClock} heading="No upcoming seminars" description="Add seminars you plan to attend using the button above." />
          ) : (
            <div className="grid gap-3">
              {seminars.queue.map((seminar) => (
                <Card key={seminar.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1"><p className="font-medium">{seminar.title}</p><p className="text-sm text-muted-foreground">{seminar.org && `${seminar.org} · `}📅 {formatDate(seminar.date)}</p>{seminar.notes && <p className="text-sm mt-2 italic text-muted-foreground">{seminar.notes}</p>}</div>
                      <div className="flex items-center gap-2 flex-shrink-0"><Button size="sm" onClick={() => handleMarkComplete(seminar.id)}><Check className="h-4 w-4 mr-1" />Mark Complete</Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSeminar("queue", seminar.id)}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
