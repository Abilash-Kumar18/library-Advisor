import React from "react";
import { Link } from "wouter";
import { Star, Library, BookOpen } from "lucide-react";
import { Book } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
  book: Book;
  matchPercent?: number;
  reason?: string;
  showMatch?: boolean;
}

export function BookCard({ book, matchPercent, reason, showMatch }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card border-border rounded-xl">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-4 text-center">
              <BookOpen className="h-12 w-12 opacity-20" />
              <span className="text-xs font-medium uppercase tracking-wider">{book.title}</span>
            </div>
          )}
          
          {showMatch && matchPercent !== undefined && (
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-accent flex items-center gap-1 shadow-sm border border-border/50">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {matchPercent}% Match
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors text-foreground">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {book.author}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors border-transparent text-xs font-normal px-2 py-0.5">
              {book.genre}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {book.rating.toFixed(1)}
            </div>
          </div>
          
          {reason && (
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground/80 italic line-clamp-2">
              "{reason}"
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
