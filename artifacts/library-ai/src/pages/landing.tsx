import React from "react";
import { Link } from "wouter";
import { BookOpen, Sparkles, Brain, Library as LibraryIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCurrentUser } from "@workspace/api-client-react";

export default function Landing() {
  const { data: currentUser } = useGetCurrentUser();
  const isLoggedIn = !!currentUser?.user;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold text-primary">
          <BookOpen className="h-8 w-8 text-accent" />
          <span>Library AI</span>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button asChild className="rounded-full font-medium" data-testid="btn-go-dashboard">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="font-medium hover:bg-accent/10 hover:text-accent" data-testid="btn-login">
                <Link href="/auth">Log In</Link>
              </Button>
              <Button asChild className="rounded-full font-medium shadow-md shadow-primary/20" data-testid="btn-signup">
                <Link href="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 md:pr-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium w-fit mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Your personal reading companion</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight">
              Discover Your Next <br />
              <span className="text-primary relative">
                Favorite Book
                <span className="absolute bottom-1 left-0 w-full h-3 bg-accent/20 -z-10 rounded-sm transform -rotate-1"></span>
              </span>
              <br /> with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Step into a beautifully curated digital reading sanctuary. Library AI understands your unique taste and finds the perfect books you didn't know you were looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" asChild className="rounded-full text-base h-14 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1" data-testid="btn-get-started">
                <Link href={isLoggedIn ? "/dashboard" : "/auth"}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-base h-14 px-8 border-border bg-card hover:bg-muted transition-all duration-300" data-testid="btn-explore">
                <Link href="/recommendations">
                  Explore Books
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-150 fill-mode-both">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-xl"></div>
            <img 
              src="/hero.png" 
              alt="Magical stack of books" 
              className="rounded-[2rem] shadow-2xl object-cover w-full aspect-square md:aspect-[4/3] border border-white/20"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20 border-y border-border/50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">A thoughtful space for readers</h2>
              <p className="text-muted-foreground text-lg">Everything you need to cultivate a meaningful reading life.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI Recommendations",
                  desc: "Our hybrid model analyzes both the content of books and collaborative reading patterns to find your perfect match with uncanny accuracy.",
                  color: "text-accent",
                  bg: "bg-accent/10"
                },
                {
                  icon: Brain,
                  title: "Smart Reading Insights",
                  desc: "Understand your reading habits. Are you a fast-paced thriller reader or a casual contemporary fiction fan? We'll help you see your patterns.",
                  color: "text-primary",
                  bg: "bg-primary/10"
                },
                {
                  icon: LibraryIcon,
                  title: "Personalized Dashboard",
                  desc: "A beautifully designed home for your reading life. Track what you're reading, what you've finished, and what's next on your list.",
                  color: "text-secondary",
                  bg: "bg-secondary/10"
                }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-start gap-4 text-left">
                    <div className={`p-4 rounded-2xl ${feature.bg} ${feature.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12 text-center text-muted-foreground">
        <div className="container mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-muted-foreground/50">
            <BookOpen className="h-6 w-6" />
            <span>Library AI</span>
          </div>
          <p>© {new Date().getFullYear()} Library AI. A quiet place to read.</p>
        </div>
      </footer>
    </div>
  );
}
