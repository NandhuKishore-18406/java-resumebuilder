"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Redirect if already logged in
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
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Login error");
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-10 w-10 border-2 border-foreground flex items-center justify-center relative">
              <div className="absolute h-[18px] w-[1px] bg-foreground" />
              <div className="absolute w-[18px] h-[1px] bg-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-heading leading-tight">Resume Builder</h1>
              <p className="text-xs text-muted-foreground italic">auto update and generation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
              Automatically Build and Update Your{" "}
              <span className="text-primary">Academic Resume</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Sync publications from ORCID, manage your academic profile, and export a clean PDF resume in minutes.
            </p>

            {/* 3-step visual */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <span className="font-medium">Fill Profile</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <span className="font-medium">Build Resume</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <span className="font-medium">Export PDF</span>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div className="max-w-md mx-auto w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Error alert */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="demo@resumebuilder.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLogging}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLogging}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLogging}>
                    {isLogging ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="text-primary hover:underline font-medium"
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