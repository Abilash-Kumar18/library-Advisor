import React, { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { Loader2, BookOpen, Compass, Library, User, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: currentUser, isLoading } = useGetCurrentUser();

  useEffect(() => {
    if (!isLoading && !currentUser?.user) {
      setLocation("/auth");
    } else if (!isLoading && currentUser?.user && !currentUser.user.onboarded && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [currentUser, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser?.user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
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
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        window.location.href = "/";
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BookOpen },
    { href: "/recommendations", label: "Recommendations", icon: Compass },
    { href: "/library", label: "My Library", icon: Library },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col h-full">
      <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-serif text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          <BookOpen className="h-6 w-6 text-accent" />
          <span>Library AI</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`} data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}>
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border flex-shrink-0">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" onClick={handleLogout} data-testid="nav-logout">
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="h-16 flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="w-full max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search books, authors..." className="pl-9 bg-background/50 border-transparent focus-visible:bg-background focus-visible:border-primary shadow-2xs rounded-full transition-all" data-testid="search-input" />
      </div>
      <div className="flex items-center gap-4">
      </div>
    </header>
  );
}
