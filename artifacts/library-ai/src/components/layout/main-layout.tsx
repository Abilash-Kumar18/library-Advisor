import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useGetCurrentUser, useLogout } from "@workspace/api-client-react";
import { 
  BookOpen, 
  Compass, 
  Library, 
  User, 
  LogOut, 
  Search, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: realCurrentUser, isLoading } = useGetCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };
  
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
  const hasOnboarded = typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true';

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
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden md:flex transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`}>
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        </div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header onToggle={toggleSidebar} isCollapsed={isCollapsed} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

function Sidebar({ isCollapsed, onToggle, mobile }: { isCollapsed: boolean; onToggle?: () => void; mobile?: boolean }) {
  const [location] = useLocation();
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

  const sidebarContent = (
    <aside className={`h-full border-r border-border bg-card flex flex-col shadow-sm transition-all duration-300 ease-in-out relative ${mobile ? "w-72" : isCollapsed ? "w-20" : "w-64"}`}>
      <div className={`h-16 flex-shrink-0 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 ${isCollapsed && !mobile ? "px-0 justify-center" : "px-4"}`}>
        <Link href="/dashboard" className={`flex items-center gap-2 font-serif font-bold text-primary hover:opacity-80 transition-all overflow-hidden shrink-0 ${isCollapsed && !mobile ? "justify-center" : ""}`}>
          <BookOpen className={`h-7 w-7 text-accent transition-transform duration-300 ${isCollapsed && !mobile ? "scale-110" : ""}`} />
          {(!isCollapsed || mobile) && <span className="tracking-tight text-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">Library AI</span>}
        </Link>
        
        {(!isCollapsed || mobile) && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={onToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className={`flex-1 p-3 space-y-1.5 overflow-y-auto mt-2 ${isCollapsed && !mobile ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          
          const linkContent = (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center rounded-xl transition-all duration-200 group relative ${
                isCollapsed && !mobile ? "justify-center h-12 w-12 mx-auto" : "gap-3 px-4 py-3"
              } ${
                isActive 
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`} 
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`} />
              {(!isCollapsed || mobile) && <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 font-medium">{item.label}</span>}
            </Link>
          );

          if (isCollapsed && !mobile) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return linkContent;
        })}
      </nav>

      <div className={`p-4 border-t border-border flex-shrink-0 bg-muted/30 ${isCollapsed && !mobile ? "px-2" : "px-4"}`}>
        <Button 
          variant="ghost" 
          className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors ${isCollapsed && !mobile ? "px-0 justify-center h-12 w-12 mx-auto rounded-xl" : "gap-3 px-4 py-3 rounded-xl"}`} 
          onClick={handleLogout} 
          data-testid="nav-logout"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!isCollapsed || mobile) && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Sign Out</span>}
        </Button>
      </div>
      
      {!mobile && isCollapsed && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="absolute right-1/2 translate-x-1/2 top-4 h-10 w-10 text-primary hover:bg-primary/10 rounded-xl transition-all z-50 md:hidden flex"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
    </aside>
  );

  return sidebarContent;
}

function Header({ onToggle, isCollapsed }: { onToggle: () => void; isCollapsed: boolean }) {
  return (
    <header className="h-16 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        {/* Toggle Button for Desktop when collapsed */}
        {isCollapsed && (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 hidden md:flex" onClick={onToggle}>
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <Sidebar isCollapsed={false} mobile onToggle={() => {}} />
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
