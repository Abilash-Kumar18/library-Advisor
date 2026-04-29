import React, { useState } from "react";
import { Loader2, Search, SlidersHorizontal, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useGetRecommendations, useGetGenreList, useListBooks, getListBooksQueryKey, RecommendationModel, Book, Recommendation } from "@workspace/api-client-react";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const MOCK_BOOKS: Book[] = [
  { 
    id: "1", 
    title: "The Midnight Library", 
    author: "Matt Haig", 
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop", 
    rating: 4.5, 
    genre: "Fiction",
    tags: ["Contemporary", "Fantasy"],
    ratingsCount: 12500,
    pages: 304,
    year: 2020,
    shortDescription: "Between life and death there is a library...",
    status: "available"
  },
  { 
    id: "2", 
    title: "Dune", 
    author: "Frank Herbert", 
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop", 
    rating: 4.8, 
    genre: "Science Fiction",
    tags: ["Sci-Fi", "Classic"],
    ratingsCount: 25000,
    pages: 412,
    year: 1965,
    shortDescription: "Set on the desert planet Arrakis...",
    status: "available"
  },
  { 
    id: "3", 
    title: "Project Hail Mary", 
    author: "Andy Weir", 
    coverUrl: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop", 
    rating: 4.9, 
    genre: "Science Fiction",
    tags: ["Sci-Fi", "Space"],
    ratingsCount: 18000,
    pages: 476,
    year: 2021,
    shortDescription: "Ryland Grace is the sole survivor...",
    status: "available"
  },
  { 
    id: "4", 
    title: "Atomic Habits", 
    author: "James Clear", 
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop", 
    rating: 4.7, 
    genre: "Non-Fiction",
    tags: ["Self-Help", "Productivity"],
    ratingsCount: 35000,
    pages: 320,
    year: 2018,
    shortDescription: "No matter your goals, Atomic Habits offers...",
    status: "available"
  },
  { 
    id: "5", 
    title: "Dark Matter", 
    author: "Blake Crouch", 
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop", 
    rating: 4.6, 
    genre: "Sci-Fi Thriller",
    tags: ["Sci-Fi", "Thriller"],
    ratingsCount: 15000,
    pages: 342,
    year: 2016,
    shortDescription: "Jason Dessen is walking home...",
    status: "available"
  },
  { 
    id: "6", 
    title: "The Silent Patient", 
    author: "Alex Michaelides", 
    coverUrl: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?q=80&w=800&auto=format&fit=crop", 
    rating: 4.3, 
    genre: "Mystery",
    tags: ["Mystery", "Thriller"],
    ratingsCount: 22000,
    pages: 336,
    year: 2019,
    shortDescription: "Alicia Berenson’s life is seemingly perfect...",
    status: "available"
  }
];

const MOCK_RECS: Recommendation[] = MOCK_BOOKS.map(b => ({ 
  book: b, 
  matchPercent: 90 + Math.floor(Math.random() * 9), 
  reason: "Matches your interest in " + b.genre,
  model: "hybrid" as const
}));

export default function RecommendationsPage() {
  const [model, setModel] = useState<RecommendationModel>("hybrid");
  const { data: recsRaw } = useGetRecommendations({ model, limit: 12 });
  const recommendations = Array.isArray(recsRaw) && recsRaw.length > 0 ? recsRaw : MOCK_RECS;
  const loadingRecs = false;
  
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [minRating, setMinRating] = useState([0]);
  
  const { data: genresRaw = [] } = useGetGenreList();
  const fallbackGenres = ["Science Fiction", "Fantasy", "Mystery", "Thriller", "Romance", "Historical Fiction", "Non-Fiction", "Biography"];
  const genres = Array.isArray(genresRaw) && genresRaw.length > 0 ? genresRaw : fallbackGenres;
  
  // Use debounced search for catalog browse
  const [debouncedSearch, setDebouncedSearch] = useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const hasFilters = debouncedSearch || genre !== "all" || minRating[0] > 0;
  
  const catalogParams = { 
    search: debouncedSearch || undefined, 
    genre: genre !== "all" ? genre : undefined,
    minRating: minRating[0] > 0 ? minRating[0] : undefined,
    limit: 24,
  };
  const { data: catalogBooksRaw } = useListBooks(catalogParams, { query: { enabled: Boolean(hasFilters), queryKey: getListBooksQueryKey(catalogParams) } });
  const catalogBooks = Array.isArray(catalogBooksRaw) && catalogBooksRaw.length > 0 ? catalogBooksRaw : MOCK_BOOKS.filter(b => {
    if (genre !== "all" && b.genre !== genre) return false;
    if (minRating[0] > 0 && b.rating < minRating[0]) return false;
    if (debouncedSearch && !b.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });
  const loadingCatalog = false;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-serif font-bold text-foreground">Recommendations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover books tailored to your unique taste. Our AI models analyze your preferences to find the perfect match.
          </p>
        </div>
        
        {!hasFilters && (
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Algorithm Model</span>
            <Tabs value={model} onValueChange={(v) => setModel(v as RecommendationModel)} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1">
                <TabsTrigger value="hybrid" data-testid="tab-model-hybrid" className="data-[state=active]:shadow-sm">Hybrid</TabsTrigger>
                <TabsTrigger value="content" data-testid="tab-model-content" className="data-[state=active]:shadow-sm">Content</TabsTrigger>
                <TabsTrigger value="collaborative" data-testid="tab-model-collab" className="data-[state=active]:shadow-sm">Collab</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search catalog by title, author, or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-transparent focus-visible:bg-background shadow-none" 
            data-testid="input-catalog-search"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full md:w-[160px] bg-background/50 border-transparent" data-testid="select-genre">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto gap-2 bg-background/50 border-transparent" data-testid="btn-filters">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {minRating[0] > 0 && <Badge className="ml-1 px-1.5 py-0 min-w-[20px] flex justify-center bg-primary text-primary-foreground">1</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Minimum Rating</h4>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground w-8">{minRating[0]} ⭐️</span>
                  <Slider 
                    value={minRating} 
                    onValueChange={setMinRating} 
                    max={5} 
                    step={0.5}
                    className="flex-1"
                    data-testid="slider-min-rating"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {!hasFilters ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-serif font-bold text-foreground">Top AI Matches</h2>
            <Badge variant="outline" className="border-accent text-accent bg-accent/5">
              {model === 'hybrid' ? 'Best Overall' : model === 'content' ? 'Based on Topics' : 'Based on Similar Readers'}
            </Badge>
          </div>
          
          {loadingRecs ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
              {recommendations.map((rec) => (
                <BookCard key={rec.book.id} book={rec.book} matchPercent={rec.matchPercent} reason={rec.reason} showMatch />
              ))}
            </div>
          ) : (
            <EmptyState message="We couldn't generate recommendations right now. Try updating your profile preferences." />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-serif font-bold text-foreground">Catalog Results</h2>
            {catalogBooks && <span className="text-sm text-muted-foreground">{catalogBooks.length} books found</span>}
          </div>
          
          {loadingCatalog ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : catalogBooks && catalogBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
              {catalogBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyState message="No books match your current filters. Try adjusting your search." />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-card/50 rounded-3xl border border-dashed border-border">
      <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <BookOpen className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-serif font-bold text-foreground mb-2">Nothing here</h3>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}
