import React from "react";
import { Link } from "wouter";
import { Loader2, ArrowRight, Flame, Clock, BookMarked, BookCheck, Bookmark, BookOpen } from "lucide-react";

import { useGetCurrentUser, useListTrendingBooks, useListContinueReading, useGetRecommendations, useGetBasedOnInterests, useGetLibraryStats } from "@workspace/api-client-react";
import { BookCard } from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  dot?: string;
  isLoading?: boolean;
}

function StatsCard({ label, value, icon, accent, dot, isLoading }: StatsCardProps) {
  return (
    <Card className="rounded-2xl border-border/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-card">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${accent}`}>
            {icon}
          </div>
          {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot} animate-pulse`} />}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-serif font-bold tracking-tight text-foreground tabular-nums">
            {isLoading ? <span className="inline-block h-8 w-16 bg-muted animate-pulse rounded" /> : value}
          </p>
          <p className="text-xs text-muted-foreground/70">Live count</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: currentUser } = useGetCurrentUser();
  const userName = currentUser?.user?.name?.split(" ")[0] || "Reader";

  const { data: recommendations, isLoading: loadingRecs } = useGetRecommendations({ limit: 10 });
  const { data: continueReading, isLoading: loadingContinue } = useListContinueReading();
  const { data: trendingBooks, isLoading: loadingTrending } = useListTrendingBooks();
  const { data: basedOnInterests, isLoading: loadingInterests } = useGetBasedOnInterests();
  const { data: stats, isLoading: loadingStats } = useGetLibraryStats();

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-foreground">Hi {userName}, ready to explore?</h1>
        <p className="text-lg text-muted-foreground">Here's what we've curated for you today.</p>
      </div>

      {/* Library Statistics */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Library Statistics</h2>
            <p className="text-sm text-muted-foreground">A live view of inventory across the catalog.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Books"
            value={stats?.totalBooks ?? 0}
            icon={<BookOpen className="h-5 w-5 text-primary" />}
            accent="bg-primary/10"
            isLoading={loadingStats}
          />
          <StatsCard
            label="Available"
            value={stats?.available ?? 0}
            icon={<BookCheck className="h-5 w-5 text-emerald-600" />}
            accent="bg-emerald-100"
            dot="bg-emerald-500"
            isLoading={loadingStats}
          />
          <StatsCard
            label="Prebooked"
            value={stats?.prebooked ?? 0}
            icon={<Bookmark className="h-5 w-5 text-accent" />}
            accent="bg-accent/10"
            dot="bg-accent"
            isLoading={loadingStats}
          />
          <StatsCard
            label="Issued"
            value={stats?.issued ?? 0}
            icon={<BookMarked className="h-5 w-5 text-rose-600" />}
            accent="bg-rose-100"
            dot="bg-rose-500"
            isLoading={loadingStats}
          />
        </div>

        {stats && stats.recentlyPrebooked.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recently Prebooked</h3>
            <div className="flex gap-3 flex-wrap">
              {stats.recentlyPrebooked.slice(0, 5).map(b => (
                <Link key={b.id} href={`/books/${b.id}`} className="group">
                  <div className="flex items-center gap-3 px-3 py-2 bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-colors">
                    <Bookmark className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{b.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Recommended for You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            Recommended for You
            <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full font-sans tracking-wide uppercase">AI Picks</span>
          </h2>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/80" data-testid="link-all-recs">
            <Link href="/recommendations">See all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        
        {loadingRecs ? (
          <div className="flex gap-4 overflow-hidden py-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="min-w-[200px] aspect-[2/3] bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {recommendations?.map((rec) => (
                <CarouselItem key={rec.book.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <BookCard book={rec.book} matchPercent={rec.matchPercent} reason={rec.reason} showMatch />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-background/80 backdrop-blur shadow-md hover:bg-background" />
            <CarouselNext className="right-2 bg-background/80 backdrop-blur shadow-md hover:bg-background" />
          </Carousel>
        )}
      </section>

      {/* Continue Reading */}
      {continueReading && continueReading.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              Continue Reading
            </h2>
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80" data-testid="link-library-reading">
              <Link href="/library">Go to library <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReading.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <Link href={`/books/${entry.book.id}`} className="shrink-0">
                  <div className="w-20 aspect-[2/3] bg-muted rounded-md overflow-hidden relative">
                    <img src={entry.book.coverUrl} alt={entry.book.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </Link>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <Link href={`/books/${entry.book.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-serif font-bold text-base truncate">{entry.book.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground truncate mb-3">{entry.book.author}</p>
                  
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>{entry.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${entry.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
        {/* Based on Interests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground">Because you like {currentUser?.user?.favoriteGenres?.[0] || "Fiction"}</h2>
          {loadingInterests ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {basedOnInterests?.slice(0, 3).map((rec) => (
                <BookCard key={rec.book.id} book={rec.book} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Books */}
        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            Trending Right Now
          </h2>
          {loadingTrending ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {trendingBooks?.slice(0, 3).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
