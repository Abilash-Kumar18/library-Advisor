import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useLogin, useSignup, getGetCurrentUserQueryKey, useGetGenreList } from "@workspace/api-client-react";

function extractApiError(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const data = (err as { data?: { error?: unknown } }).data;
    if (data && typeof data.error === "string") return data.error;
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") {
      const cleaned = message.replace(/^HTTP \d+[^:]*:\s*/, "").trim();
      if (cleaned) return cleaned;
    }
  }
  return fallback;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  favoriteGenres: z.array(z.string()).default([]),
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const { data: genres = [] } = useGetGenreList();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", favoriteGenres: [] },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Welcome back", description: "Successfully logged in." });
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({ title: "Login failed", description: extractApiError(error, "Invalid credentials"), variant: "destructive" });
      }
    });
  };

  const onSignupSubmit = (data: z.infer<typeof signupSchema>) => {
    signupMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Account created", description: "Welcome to Library AI!" });
        setLocation("/onboarding");
      },
      onError: (error) => {
        toast({ title: "Signup failed", description: extractApiError(error, "Could not create account"), variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <img 
          src="/auth-bg.png" 
          alt="Cozy reading nook" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply"
        />
        <div className="relative z-10 p-12 max-w-lg text-center backdrop-blur-sm bg-background/30 rounded-3xl border border-white/20 shadow-2xl">
          <BookOpen className="h-16 w-16 mx-auto text-primary mb-6" />
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Your digital reading sanctuary</h2>
          <p className="text-lg text-foreground/80 font-medium">
            Join thousands of readers discovering their next favorite book through thoughtful AI recommendations.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2 font-serif text-2xl font-bold text-primary lg:hidden justify-center mb-8">
            <BookOpen className="h-8 w-8 text-accent" />
            <span>Library AI</span>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                  <TabsTrigger value="login" data-testid="tab-login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Log In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <TabsContent value="login">
                <CardContent>
                  <CardTitle className="text-2xl font-serif mb-2">Welcome back</CardTitle>
                  <CardDescription className="mb-6">Enter your details to access your library.</CardDescription>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="reader@example.com" type="email" {...field} data-testid="input-login-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input placeholder="••••••••" type="password" {...field} data-testid="input-login-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-11 text-base shadow-sm" disabled={loginMutation.isPending} data-testid="btn-submit-login">
                        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Log In
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardContent>
                  <CardTitle className="text-2xl font-serif mb-2">Create an account</CardTitle>
                  <CardDescription className="mb-6">Start building your personalized reading library.</CardDescription>
                  
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Austen" {...field} data-testid="input-signup-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="jane@example.com" type="email" {...field} data-testid="input-signup-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input placeholder="••••••••" type="password" {...field} data-testid="input-signup-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="favoriteGenres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Interests</FormLabel>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {genres.slice(0, 8).map(genre => {
                                const isSelected = field.value.includes(genre);
                                return (
                                  <Badge
                                    key={genre}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`cursor-pointer px-3 py-1 text-xs transition-colors hover:bg-primary/90 ${isSelected ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                                    onClick={() => {
                                      const newValues = isSelected
                                        ? field.value.filter(v => v !== genre)
                                        : [...field.value, genre];
                                      field.onChange(newValues);
                                    }}
                                    data-testid={`badge-genre-${genre}`}
                                  >
                                    {genre}
                                  </Badge>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-11 text-base shadow-sm mt-4" disabled={signupMutation.isPending} data-testid="btn-submit-signup">
                        {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
