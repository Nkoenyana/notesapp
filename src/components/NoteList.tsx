
"use client";

import type React from 'react';
import type { Note } from '@/lib/types';
import NoteCard from './NoteCard';
import { Loader2 } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onShareNote: (noteId: string) => void;
  onTogglePinNote: (noteId: string) => void; // Added for pin functionality
  isLoadingMore: boolean; // For lazy loading indicator
  hasMoreNotes: boolean; // To know if we should show loading or "no more notes"
}

const NoteList: React.FC<NoteListProps> = ({ notes, onEditNote, onDeleteNote, onShareNote, onTogglePinNote, isLoadingMore, hasMoreNotes }) => {
  if (notes.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-4 opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
        <h2 className="text-xl font-semibold text-muted-foreground">No notes found</h2>
        <p className="text-muted-foreground mt-1">Try adjusting your search or click "New Note" to create one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6 animate-fade-in">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
            onShare={onShareNote}
            onTogglePinNote={onTogglePinNote} // Pass down the handler
          />
        ))}
      </div>
      {isLoadingMore && (
        <div className="col-span-full flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground ml-2">Loading more notes...</p>
        </div>
      )}
      {!isLoadingMore && !hasMoreNotes && notes.length > 0 && (
         <div className="col-span-full text-center py-6">
           <p className="text-muted-foreground">You've reached the end of your notes!</p>
         </div>
      )}
    </>
  );
};

export default NoteList;
