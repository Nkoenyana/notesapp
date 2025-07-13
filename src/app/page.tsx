"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Note, AttachmentFile } from '@/lib/types';
import Header from '@/components/Header';
import NoteList from '@/components/NoteList';
import NoteEditorDialog from '@/components/NoteEditorDialog';
import ShareNoteDialog from '@/components/ShareNoteDialog';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import * as noteService from '@/lib/note-service';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import amplifyJson from 'amplifyJson'
import {generateClient} from "aws-amplify/data"; // Import Data client generator
import "@aws-amplify/ui-react/styles.css";
const NOTES_PER_PAGE = 9;
const SCROLL_THRESHOLD = 200;

Amplify.configure(amplifyJson, { ssr: true });
const client = generateClient({
  authMode: 'userPool', // Use user pool for authentication
});

export default function AppWithAuth(){
  return (
    <Authenticator>
      {({user, signOut}) => (
        <Home user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [noteToShareId, setNoteToShareId] = useState<string | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const subscription = noteService.subscribeToNotes({
      next: (fetchedNotes) => {
        setNotes(fetchedNotes);
      },
      error: (error) => {
        console.error("Error fetching notes:", error);
        toast({ title: "Error loading notes", description: "Could not fetch notes from the data source.", variant: "destructive" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const allProcessedNotes = useMemo(() => {
    let processed = [...notes];
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      processed = processed.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(lowercasedSearchTerm);
        const tagMatch = note.tags?.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));
        const contentMatch = note.content.toLowerCase().includes(lowercasedSearchTerm);
        return titleMatch || tagMatch || contentMatch;
      });
    }
    return processed.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchTerm]);

  const notesToDisplay = useMemo(() => {
    return allProcessedNotes.slice(0, currentPage * NOTES_PER_PAGE);
  }, [allProcessedNotes, currentPage]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - SCROLL_THRESHOLD &&
      !isLoadingMore &&
      currentPage * NOTES_PER_PAGE < allProcessedNotes.length
    ) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, currentPage, allProcessedNotes.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddNote = () => {
    setNoteToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (noteData: Note, attachmentsToUpload: AttachmentFile[]) => {
    try {
      await noteService.saveNote(noteData, attachmentsToUpload);
      toast({
        title: noteToEdit ? "Note Updated" : "Note Created",
        description: `"${noteData.title}" has been successfully ${noteToEdit ? 'updated' : 'saved'}.`,
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({ title: "Error Saving Note", variant: "destructive" });
    } finally {
      setIsEditorOpen(false);
      setNoteToEdit(null);
    }
  };

  const handleDeleteNoteRequest = (noteId: string) => {
    setNoteToDeleteId(noteId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (noteToDeleteId) {
      try {
        await noteService.deleteNote(noteToDeleteId);
        toast({
          title: "Note Deleted",
          description: "The note has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting note:", error);
        toast({ title: "Error Deleting Note", variant: "destructive" });
      } finally {
        setNoteToDeleteId(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleShareNote = (noteId: string) => {
    setNoteToShareId(noteId);
    setIsShareDialogOpen(true);
  };

  const handleTogglePinNote = async (noteId: string) => {
    const noteToPin = notes.find(n => n.id === noteId);
    if (!noteToPin) return;
    
    try {
      await noteService.togglePin(noteId, !noteToPin.isPinned);
      toast({
        title: `Note ${!noteToPin.isPinned ? "Pinned" : "Unpinned"}`,
        description: `"${noteToPin.title}" has been ${!noteToPin.isPinned ? 'pinned' : 'unpinned'}.`,
      });
    } catch (error) {
      console.error("Error pinning note:", error);
      toast({ title: "Error updating pin status", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onAddNote={handleAddNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        <NoteList
          notes={notesToDisplay}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNoteRequest}
          onShareNote={handleShareNote}
          onTogglePinNote={handleTogglePinNote}
          isLoadingMore={isLoadingMore}
          hasMoreNotes={currentPage * NOTES_PER_PAGE < allProcessedNotes.length}
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        NoteLink &copy; {new Date().getFullYear()}
      </footer>

      {isEditorOpen && (
        <NoteEditorDialog
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveNote}
          noteToEdit={noteToEdit}
        />
      )}

      {isShareDialogOpen && (
        <ShareNoteDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          noteId={noteToShareId}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNote} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
