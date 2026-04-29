import React, { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { Loader2, BookOpen, Compass, Library, User, LogOut, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: realCurrentUser, isLoading } = useGetCurrentUser();
  
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
  const hasOnboarded = typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true';
  const currentUser = isAuth ? { user: { name: "Reader", onboarded: hasOnboarded, favoriteGenres: [] } } : null;

  useEffect(() => {
    if (!isLoading && !isAuth) {
      setLocation("/auth");
    } else if (!isLoading && isAuth && !hasOnboarded && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [isAuth, hasOnboarded, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('onboarded');
    queryClient.clear();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BookOpen },
    { href: "/recommendations", label: "Recommendations", icon: Compass },
    { href: "/library", label: "My Library", icon: Library },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full shadow-sm">
      <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 font-serif text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <BookOpen className="h-7 w-7 text-accent" />
          <span className="tracking-tight">Library AI</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`} 
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border flex-shrink-0 bg-muted/30">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" onClick={handleLogout} data-testid="nav-logout">
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="h-16 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="w-full max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search books, authors..." className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 shadow-none rounded-full h-10 transition-all" data-testid="search-input" />
        </div>
      </div>
      
      {/* Mobile Logo Visibility */}
      <div className="flex md:hidden items-center justify-center absolute left-1/2 -translate-x-1/2">
        <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
          <BookOpen className="h-6 w-6 text-accent" />
          <span>Library AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
      </div>
    </header>
  );
}
