"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { backendRegister } from "@/lib/auth";
import { GraduationCap } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password too short");
      return;
    }

    setIsRegistering(true);

    try {
      const result = await backendRegister(email, password, name);
      if (result.error) {
        setError(result.error);
        toast.error("Registration failed", { description: result.error });
      } else {
        toast.success("Account created!");
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Registration error");
    } finally {
      setIsRegistering(false);
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
      <div className="absolute top-1/4 right-1/10 w-96 h-96 rounded-full bg-[#12708c]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/10 w-96 h-96 rounded-full bg-[#0f5c73]/10 blur-3xl pointer-events-none" />

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

      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full flex items-center relative z-10">
        <div className="max-w-md mx-auto w-full">
          <Card className="glass-card rounded-2xl border-white/60 dark:border-white/10 p-2 shadow-xl shadow-primary/10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription className="font-medium">Enter your details to register a new account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isRegistering}
                    className="rounded-xl bg-background/50 border-border/80"
                  />
                </div>

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
                    disabled={isRegistering}
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
                    disabled={isRegistering}
                    className="rounded-xl bg-background/50 border-border/80"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isRegistering}
                    className="rounded-xl bg-background/50 border-border/80"
                  />
                </div>

                <Button type="submit" className="w-full rounded-xl font-bold shadow-md shadow-primary/20" disabled={isRegistering}>
                  {isRegistering ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Creating account...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground font-medium pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-primary hover:underline font-bold"
                  >
                    Login
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}