import React, { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowRight, ArrowLeft, BookOpen, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useGetCurrentUser, useUpdatePreferences, getGetCurrentUserQueryKey, useGetGenreList } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: currentUser, isLoading } = useGetCurrentUser();
  const { data } = useGetGenreList();
  
  const fallbackGenres = ["Science Fiction", "Fantasy", "Mystery", "Thriller", "Romance", "Historical Fiction", "Non-Fiction", "Biography", "Self-Help", "Poetry", "Horror", "Business"];
  const genres = Array.isArray(data) && data.length > 0 ? data : fallbackGenres;
  
  const updatePreferencesMutation = useUpdatePreferences();

  const [step, setStep] = useState(1);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [authorInput, setAuthorInput] = useState("");
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([]);
  const [readingStyle, setReadingStyle] = useState<"fast_paced" | "academic" | "casual">("casual");

  // Sync initial state if user has some already
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true') {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleFinish = () => {
    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem('onboarded', 'true');
      queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      toast({ title: "Preferences saved", description: "Your library is ready!" });
      setLocation("/dashboard");
    }, 500);
  };

  const handleAddAuthor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && authorInput.trim() !== "") {
      e.preventDefault();
      if (!favoriteAuthors.includes(authorInput.trim())) {
        setFavoriteAuthors([...favoriteAuthors, authorInput.trim()]);
      }
      setAuthorInput("");
    }
  };

  const toggleGenre = (genre: string) => {
    setFavoriteGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const removeAuthor = (author: string) => {
    setFavoriteAuthors(prev => prev.filter(a => a !== author));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 font-serif text-xl font-bold text-primary mb-12 justify-center">
          <BookOpen className="h-6 w-6 text-accent" />
          <span>Library AI</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step - 1) / 2 * 100}%` }} />
          </div>
          {[1, 2, 3].map((num) => (
            <div 
              key={num} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm ${
                step >= num ? "bg-primary text-primary-foreground border-2 border-background" : "bg-card text-muted-foreground border-2 border-muted"
              }`}
            >
              {step > num ? <Check className="h-5 w-5" /> : num}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border shadow-xl shadow-primary/5 rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-3xl font-serif font-bold mb-3">What do you like to read?</h2>
              <p className="text-muted-foreground mb-8">Select a few genres to help us understand your taste. We'll use this to find your next great read.</p>
              
              <div className="flex flex-wrap gap-3 pb-8">
                {genres.map((genre) => {
                  const isSelected = favoriteGenres.includes(genre);
                  return (
                    <Badge
                      key={genre}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 border ${
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-transparent" 
                          : "bg-card hover:bg-muted text-foreground border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleGenre(genre)}
                      data-testid={`genre-${genre}`}
                    >
                      {genre}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-3xl font-serif font-bold mb-3">Any favorite authors?</h2>
              <p className="text-muted-foreground mb-8">Type an author's name and press enter. Skip if you're not sure.</p>
              
              <div className="space-y-6 pb-8">
                <Input 
                  placeholder="e.g., Neil Gaiman, Jane Austen..." 
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyDown={handleAddAuthor}
                  className="h-14 text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary transition-all"
                  data-testid="input-author"
                />
                
                <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-xl bg-muted/30 border border-dashed border-border/50">
                  {favoriteAuthors.length === 0 ? (
                    <span className="text-muted-foreground italic text-sm my-auto">No authors added yet</span>
                  ) : (
                    favoriteAuthors.map((author) => (
                      <Badge
                        key={author}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-secondary/10 text-secondary hover:bg-destructive/10 hover:text-destructive cursor-pointer group flex items-center gap-1 border-transparent"
                        onClick={() => removeAuthor(author)}
                        data-testid={`author-${author}`}
                      >
                        {author}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">×</span>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-3xl font-serif font-bold mb-3">How do you like to read?</h2>
              <p className="text-muted-foreground mb-8">This helps us recommend books with the right pacing and complexity.</p>
              
              <RadioGroup 
                value={readingStyle} 
                onValueChange={(val: any) => setReadingStyle(val)}
                className="gap-4 pb-8"
              >
                {[
                  { id: "casual", title: "Casual & Relaxed", desc: "Easy reads, contemporary fiction, beach reads" },
                  { id: "fast_paced", title: "Fast Paced", desc: "Thrillers, page-turners, action-packed" },
                  { id: "academic", title: "Deep & Academic", desc: "Non-fiction, dense literary fiction, history" }
                ].map((style) => (
                  <Label
                    key={style.id}
                    className={`flex flex-col p-5 border rounded-2xl cursor-pointer transition-all hover:bg-muted/50 ${
                      readingStyle === style.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-lg text-foreground">{style.title}</span>
                      <RadioGroupItem value={style.id} id={style.id} data-testid={`radio-style-${style.id}`} />
                    </div>
                    <span className="text-muted-foreground font-normal">{style.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-2"
              data-testid="btn-prev-step"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(s => Math.min(3, s + 1))}
                className="gap-2 rounded-full px-6"
                data-testid="btn-next-step"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={updatePreferencesMutation.isPending}
                className="gap-2 rounded-full px-8 shadow-md shadow-primary/20"
                data-testid="btn-finish-onboarding"
              >
                {updatePreferencesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enter Library <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
