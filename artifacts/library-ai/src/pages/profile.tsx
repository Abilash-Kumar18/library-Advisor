import React from "react";
import { Loader2, Brain, BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import { useGetProfileInsights, useGetCurrentUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
  const hasOnboarded = typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true';
  const currentUser = isAuth ? { user: { name: "Devaroopa E", email: "roopadeva48cse24_27@ksrce.ac.in", onboarded: hasOnboarded, readingStyle: "casual", favoriteGenres: ["Fantasy"] } } : null;
  
  const { data: insightsRaw } = useGetProfileInsights();
  
  const MOCK_INSIGHTS = {
    booksRead: 12,
    readingTimeHours: 48,
    averageRating: 4.6,
    favoriteGenre: "Science Fiction",
    aiInsight: "You have a strong affinity for speculative fiction and seem to enjoy deep, complex world-building. Your reading pace is steady, and you tend to favor authors who blend philosophical themes with action.",
    genreBreakdown: [
      { genre: "Science Fiction", count: 15 },
      { genre: "Fantasy", count: 12 },
      { genre: "Mystery", count: 8 },
      { genre: "Non-Fiction", count: 5 },
      { genre: "Biography", count: 3 }
    ]
  };

  const insights = insightsRaw?.booksRead !== undefined ? insightsRaw : MOCK_INSIGHTS;
  const isLoading = false;

  if (!insights || !currentUser?.user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const user = currentUser.user;
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  // Calculate max count for the bar chart
  const maxGenreCount = Math.max(...insights.genreBreakdown.map(g => g.count), 1);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-8 bg-card rounded-3xl border border-border shadow-sm">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-serif">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
              {user.readingStyle?.replace(/_/g, ' ')} reader
            </span>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
              Joined recently
            </span>
          </div>
        </div>
      </div>

      {/* AI Insight Callout */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-background to-accent/5 p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-bold font-serif text-xl text-foreground mb-2">Reading Profile Insight</h3>
          <p className="text-muted-foreground leading-relaxed text-lg italic">
            "{insights.aiInsight}"
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-border shadow-sm bg-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Books Read</CardTitle>
            <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{insights.booksRead}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm bg-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reading Time</CardTitle>
            <Clock className="h-4 w-4 text-secondary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{insights.readingTimeHours}<span className="text-lg font-sans text-muted-foreground font-normal ml-1">hrs</span></div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-accent fill-accent group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{insights.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Genre</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-serif truncate mt-1">{insights.favoriteGenre}</div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Chart */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Genre Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 mt-2">
            {insights.genreBreakdown.map((item, index) => {
              // Assign different colors based on index
              const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted-foreground', 'bg-border'];
              const colorClass = colors[index % colors.length];
              
              return (
                <div key={item.genre} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-muted-foreground truncate" title={item.genre}>
                    {item.genre}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${(item.count / maxGenreCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-6">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
