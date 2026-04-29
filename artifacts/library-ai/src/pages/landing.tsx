import React from "react";
import { Link } from "wouter";
import { BookOpen, Sparkles, Brain, Library as LibraryIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Landing() {
  const { data: currentUser } = useGetCurrentUser();
  const isLoggedIn = !!currentUser?.user;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      <header className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between border-b border-border/50 relative z-10">
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
              <Button variant="ghost" asChild className="font-medium hover:bg-accent/10 hover:text-accent transition-colors" data-testid="btn-login">
                <Link href="/auth">Log In</Link>
              </Button>
              <Button asChild className="rounded-full font-medium shadow-md shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all" data-testid="btn-signup">
                <Link href="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-8 py-4 md:py-8 lg:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-5rem)] md:min-h-[85vh]">
          <motion.div 
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="flex flex-col gap-4 md:pr-8"
          >
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1] tracking-tight mt-[-2rem]">
              Discover Your Next <br />
              <span className="text-primary relative inline-block">
                Favorite Book
                <span className="absolute bottom-1 left-0 w-full h-3 bg-accent/20 -z-10 rounded-sm transform -rotate-2"></span>
              </span>
              <br /> with AI
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mt-1">
              Step into a beautifully curated digital reading sanctuary. Library AI understands your unique taste and finds the perfect books you didn't know you were looking for.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" asChild className="rounded-full text-base h-14 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all duration-300" data-testid="btn-get-started">
                <Link href={isLoggedIn ? "/dashboard" : "/auth"}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-base h-14 px-8 border-border bg-card hover:bg-muted hover:-translate-y-1 active:scale-95 transition-all duration-300" data-testid="btn-explore">
                <Link href="/recommendations">
                  Explore Books
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full max-w-md mx-auto md:max-w-none"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
            <img 
              src="/hero.png" 
              alt="Magical stack of books" 
              className="rounded-[2rem] shadow-2xl object-cover w-full aspect-[4/3] border border-white/10 hover:rotate-1 hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-12 md:py-20 border-t border-border/50 flex-1">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">A thoughtful space for readers</h2>
              <p className="text-muted-foreground text-lg">Everything you need to cultivate a meaningful reading life.</p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto w-full">
              <ScrollStack 
                useWindowScroll={true} 
                itemStackDistance={35} 
                itemDistance={50}
                itemScale={0.03}
                blurAmount={1.5}
                rotationAmount={0}
                baseScale={0.92}
                stackPosition="15%"
                scaleEndPosition="5%"
              >
                {[
                  {
                    icon: Sparkles,
                    title: "AI Recommendations",
                    desc: "Our hybrid model analyzes both the content of books and collaborative reading patterns to find your perfect match with uncanny accuracy.",
                    color: "text-accent",
                    bg: "bg-accent/10",
                    hoverGlow: "hover:shadow-accent/30"
                  },
                  {
                    icon: Brain,
                    title: "Smart Reading Insights",
                    desc: "Understand your reading habits. Are you a fast-paced thriller reader or a casual contemporary fiction fan? We'll help you see your patterns.",
                    color: "text-primary",
                    bg: "bg-primary/10",
                    hoverGlow: "hover:shadow-primary/30"
                  },
                  {
                    icon: LibraryIcon,
                    title: "Personalized Dashboard",
                    desc: "A beautifully designed home for your reading life. Track what you're reading, what you've finished, and what's next on your list.",
                    color: "text-secondary",
                    bg: "bg-secondary/10",
                    hoverGlow: "hover:shadow-secondary/30"
                  }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <ScrollStackItem key={i}>
                      <div className={`group bg-card p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-xl hover:shadow-2xl ${feature.hoverGlow} flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 text-left cursor-default relative overflow-hidden transition-all duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className={`p-6 md:p-8 rounded-[2rem] ${feature.bg} ${feature.color} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shrink-0`}>
                          <Icon className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <h3 className="text-2xl md:text-3xl font-bold font-serif text-foreground">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{feature.desc}</p>
                        </div>
                      </div>
                    </ScrollStackItem>
                  );
                })}
              </ScrollStack>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-8 text-center text-muted-foreground">
        <div className="container mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 font-serif text-lg font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <BookOpen className="h-5 w-5" />
            <span>Library AI</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Library AI. A quiet place to read.</p>
        </div>
      </footer>
    </div>
  );
}
