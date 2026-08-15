"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLogging(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
        toast.error("Login failed", { description: result.error });
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Login error");
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-gradient">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-gradient flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-[#12708c]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#0f5c73]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/20 dark:border-white/10 bg-background/75 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#12708c] via-[#0f5c73] to-[#1a8bad] flex items-center justify-center text-white shadow-md shadow-[#12708c]/25">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
                Academic Resume Builder
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Automated Profile & Resume Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full flex items-center relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Academic Workspace</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              Automatically Build & Update Your{" "}
              <span className="bg-gradient-to-r from-[#12708c] via-[#0f5c73] to-[#1a8bad] bg-clip-text text-transparent">
                Academic Resume
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl font-medium leading-relaxed">
              Manage your academic credentials, store certificates and seminars, and export clean, professional PDF resumes in minutes.
            </p>

            {/* 3-step visual */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  01
                </div>
                <span className="font-bold text-sm">Fill Profile</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  02
                </div>
                <span className="font-bold text-sm">Build Resume</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  03
                </div>
                <span className="font-bold text-sm">Export PDF</span>
              </div>
            </div>
          </div>

          {/* Glass Auth Card */}
          <div className="max-w-md mx-auto w-full">
            <Card className="glass-card rounded-2xl border-white/60 dark:border-white/10 p-2 shadow-xl shadow-primary/10">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription className="font-medium">Enter your email and password to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLogging}
                      className="rounded-xl bg-background/50 border-border/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLogging}
                      className="rounded-xl bg-background/50 border-border/80"
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-xl font-bold shadow-md shadow-primary/20" disabled={isLogging}>
                    {isLogging ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground font-medium pt-2">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="text-primary hover:underline font-bold"
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}