import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Loader2, Star, ArrowLeft, Plus, CheckCircle, Clock, BookOpen, Trash2, Library as LibraryIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { 
  useGetBook, 
  useAddToLibrary, 
  useUpdateLibraryEntry, 
  useRemoveFromLibrary,
  getGetBookQueryKey,
  getListLibraryQueryKey,
  getListContinueReadingQueryKey,
  BookDetailLibraryStatus,
  AddLibraryEntryRequestStatus
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BookCard } from "@/components/book-card";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [progressDialog, setProgressDialog] = useState(false);
  const [tempProgress, setTempProgress] = useState([0]);
  
  const { data: book, isLoading } = useGetBook(id!, { query: { enabled: !!id, queryKey: getGetBookQueryKey(id!) } });
  
  const addMutation = useAddToLibrary();
  const updateMutation = useUpdateLibraryEntry();
  const removeMutation = useRemoveFromLibrary();

  const invalidateLibraryQueries = () => {
    queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(id!) });
    queryClient.invalidateQueries({ queryKey: getListLibraryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListContinueReadingQueryKey() });
  };

  const handleAdd = (status: AddLibraryEntryRequestStatus) => {
    addMutation.mutate({ data: { bookId: id!, status } }, {
      onSuccess: () => {
        toast({ title: "Added to library", description: `Book marked as ${status.replace(/_/g, ' ')}` });
        invalidateLibraryQueries();
      }
    });
  };

  const handleUpdateStatus = (status: BookDetailLibraryStatus) => {
    updateMutation.mutate({ id: id!, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: "Status updated", description: `Book marked as ${status?.replace(/_/g, ' ')}` });
        invalidateLibraryQueries();
      }
    });
  };

  const handleUpdateProgress = () => {
    updateMutation.mutate({ id: id!, data: { progress: tempProgress[0] } }, {
      onSuccess: () => {
        toast({ title: "Progress updated", description: `You're now ${tempProgress[0]}% through.` });
        setProgressDialog(false);
        invalidateLibraryQueries();
      }
    });
  };

  const handleRate = (rating: number) => {
    updateMutation.mutate({ id: id!, data: { rating } }, {
      onSuccess: () => {
        toast({ title: "Rating saved" });
        invalidateLibraryQueries();
      }
    });
  };

  const handleRemove = () => {
    removeMutation.mutate({ id: id! }, {
      onSuccess: () => {
        toast({ title: "Removed from library" });
        invalidateLibraryQueries();
      }
    });
  };

  if (isLoading || !book) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => window.history.back()} data-testid="btn-back">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Cover column */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 flex flex-col gap-6">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border border-border bg-muted">
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col gap-3">
            {!book.inLibrary ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="w-full gap-2 rounded-xl text-base shadow-sm" disabled={addMutation.isPending} data-testid="btn-add-library">
                    <Plus className="h-5 w-5" /> Add to Library
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="center">
                  <DropdownMenuItem onClick={() => handleAdd("reading")} className="gap-2 p-3 text-base cursor-pointer">
                    <Clock className="h-4 w-4 text-secondary" /> Currently Reading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAdd("want_to_read")} className="gap-2 p-3 text-base cursor-pointer">
                    <BookOpen className="h-4 w-4 text-accent" /> Want to Read
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAdd("read")} className="gap-2 p-3 text-base cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-primary" /> Read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`uppercase tracking-wider py-1 px-3 ${
                    book.libraryStatus === 'reading' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                    book.libraryStatus === 'read' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-accent/10 text-accent border-accent/20'
                  }`}>
                    {book.libraryStatus?.replace(/_/g, ' ')}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" data-testid="btn-edit-status">
                        <LibraryIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {book.libraryStatus !== 'reading' && <DropdownMenuItem onClick={() => handleUpdateStatus('reading')} className="gap-2"><Clock className="h-4 w-4 text-secondary" /> Move to Reading</DropdownMenuItem>}
                      {book.libraryStatus !== 'want_to_read' && <DropdownMenuItem onClick={() => handleUpdateStatus('want_to_read')} className="gap-2"><BookOpen className="h-4 w-4 text-accent" /> Move to Want to Read</DropdownMenuItem>}
                      {book.libraryStatus !== 'read' && <DropdownMenuItem onClick={() => handleUpdateStatus('read')} className="gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Mark as Read</DropdownMenuItem>}
                      <DropdownMenuItem onClick={handleRemove} className="text-destructive gap-2 focus:text-destructive"><Trash2 className="h-4 w-4" /> Remove from Library</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {book.libraryStatus === 'reading' && (
                  <Dialog open={progressDialog} onOpenChange={setProgressDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-background mt-2 border-dashed gap-2" data-testid="btn-update-progress">
                        Update Progress
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Progress</DialogTitle>
                      </DialogHeader>
                      <div className="py-8 space-y-8">
                        <div className="text-center font-bold text-4xl font-serif text-primary">{tempProgress[0]}%</div>
                        <Slider value={tempProgress} onValueChange={setTempProgress} max={100} step={1} />
                        <Button className="w-full h-11" onClick={handleUpdateProgress} disabled={updateMutation.isPending} data-testid="btn-save-progress">Save Progress</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {book.libraryStatus === 'read' && (
                  <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/50 mt-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => handleRate(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          data-testid={`btn-rate-${star}`}
                        >
                          <svg 
                            className={`w-6 h-6 ${book.userRating && star <= book.userRating ? "text-accent fill-accent" : "text-muted fill-muted hover:fill-accent/30"}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm p-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Global Rating</span>
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {book.rating.toFixed(1)} <span className="font-normal text-muted-foreground text-xs ml-1">({book.ratingsCount.toLocaleString()})</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground">Length</span>
                <span className="font-bold text-foreground">{book.pages} pages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="flex-1 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">{book.title}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-serif">by <span className="text-foreground border-b-2 border-primary/30 pb-0.5">{book.author}</span></p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-transparent">{book.genre}</Badge>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">{book.year}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-foreground">About the book</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{book.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {book.tags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-card text-muted-foreground hover:bg-muted font-normal px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {book.authorBio && (
            <div className="p-6 bg-card rounded-3xl border border-border shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-foreground flex items-center gap-2">
                About {book.author}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {book.authorBio}
              </p>
            </div>
          )}
        </div>
      </div>

      {book.similarBooks && book.similarBooks.length > 0 && (
        <div className="pt-12 border-t border-border/50 space-y-6 mt-12">
          <h2 className="text-2xl font-serif font-bold text-foreground">Similar to this</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {book.similarBooks.map((similarBook) => (
              <BookCard key={similarBook.id} book={similarBook} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
