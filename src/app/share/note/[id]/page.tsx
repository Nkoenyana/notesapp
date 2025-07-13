import Link from 'next/link';
import { getNoteById } from '@/lib/note-service';
import SharedNoteView from '@/components/SharedNoteView';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Don't cache shared pages

export default async function SharedNotePage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound();
  }

  const note = await getNoteById(params.id);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">Note Not Found</h1>
        <p className="text-muted-foreground mb-6">The note you are looking for does not exist or has been deleted.</p>
        <Button asChild>
          <Link href="/">
            <ChevronLeft />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-headline font-semibold">NoteLink</h1>
              <Button asChild variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/">
                  <ChevronLeft />
                  Back to All Notes
                </Link>
              </Button>
          </div>
        </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SharedNoteView note={note} />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        NoteLink &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
