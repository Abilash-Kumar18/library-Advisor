import React, { useState } from "react";
import { Loader2, Library as LibraryIcon, BookOpen, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

import { useListLibrary, ListLibraryStatus } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LibraryPage() {
  const [status, setStatus] = useState<ListLibraryStatus | "all">("reading");
  
  const { data: libraryEntries, isLoading } = useListLibrary(
    status !== "all" ? { status } : {}
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2 pb-6 border-b border-border/50">
        <h1 className="text-4xl font-serif font-bold text-foreground">My Library</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your personal collection. Track your progress, rate the books you've read, and curate your wishlist.
        </p>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full">
        <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-4 p-1 bg-muted/50 mb-8 h-12">
          <TabsTrigger value="reading" className="gap-2 h-full data-[state=active]:shadow-sm" data-testid="tab-lib-reading">
            <Clock className="h-4 w-4 hidden sm:block" /> Currently Reading
          </TabsTrigger>
          <TabsTrigger value="want_to_read" className="gap-2 h-full data-[state=active]:shadow-sm" data-testid="tab-lib-want">
            <BookOpen className="h-4 w-4 hidden sm:block" /> Want to Read
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2 h-full data-[state=active]:shadow-sm" data-testid="tab-lib-read">
            <CheckCircle className="h-4 w-4 hidden sm:block" /> Read
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2 h-full data-[state=active]:shadow-sm" data-testid="tab-lib-all">
            <LibraryIcon className="h-4 w-4 hidden sm:block" /> All
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : libraryEntries && libraryEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraryEntries.map((entry) => (
                <LibraryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-card/50 rounded-3xl border border-dashed border-border">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <LibraryIcon className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">No books here yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {status === "all" 
                  ? "Your library is empty. Discover new books and add them to your collection." 
                  : `You don't have any books marked as '${status.replace(/_/g, ' ')}' yet.`}
              </p>
              <Link href="/recommendations" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                Explore Recommendations <BookOpen className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

function LibraryCard({ entry }: { entry: any }) {
  const { book, status, progress, rating } = entry;
  
  const statusColors = {
    reading: "bg-secondary/10 text-secondary border-secondary/20",
    read: "bg-primary/10 text-primary border-primary/20",
    want_to_read: "bg-accent/10 text-accent border-accent/20"
  };
  
  const statusLabels = {
    reading: "Reading",
    read: "Read",
    want_to_read: "Want to Read"
  };

  return (
    <Link href={`/books/${book.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card border-border rounded-2xl">
        <div className="flex h-40">
          <div className="w-28 shrink-0 bg-muted overflow-hidden relative">
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          <CardContent className="p-4 flex-1 flex flex-col min-w-0">
            <div className="mb-1">
              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider py-0 px-2 h-5 font-semibold ${statusColors[status as keyof typeof statusColors]}`}>
                {statusLabels[status as keyof typeof statusLabels]}
              </Badge>
            </div>
            
            <h3 className="font-serif font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors text-foreground mt-1">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate mb-auto">
              {book.author}
            </p>
            
            {status === "reading" && (
              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            
            {status === "read" && rating && (
              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-4 h-4 ${star <= rating ? "text-accent fill-accent" : "text-muted fill-muted"}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
