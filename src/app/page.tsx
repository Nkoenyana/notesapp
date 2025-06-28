
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Note, AttachmentFile } from '@/lib/types';
import Header from '@/components/Header';
import NoteList from '@/components/NoteList';
import NoteEditorDialog from '@/components/NoteEditorDialog';
import ShareNoteDialog from '@/components/ShareNoteDialog';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {Authenticator } from "@aws-amplify/ui-react"; // Import Authenticator for authentication
import "@aws-amplify/ui-react/styles.css";
// authentication 
import { generateClient } from "aws-amplify/data"; // Import Data client generator
import amplifyJson from "amplify-json"; // Import your Amplify configuration
import type { Schema } from "@/amplify/data/resource"; // Import your schema type
import { Amplify } from "aws-amplify"; // Import AmplifyJson for configuration
const NOTES_PER_PAGE = 9; // Number of notes to load per scroll
const SCROLL_THRESHOLD = 200; // Pixels from bottom to trigger load

Amplify.configure(amplifyJson); // Configure Amplify with your JSON config
const client = generateClient({
  authMode: 'userPool', // Use user pool for authentication
})

// Expanded sample initial notes for demonstration and lazy loading testing
const initialNotes: Note[] = [
  {
    id: crypto.randomUUID(),
    title: "Grocery List - Weekend",
    content: "- Milk\n- Eggs\n- Bread\n- Coffee beans\n- Avocados\n- Chicken breast",
    attachments: [],
    tags: ["shopping", "food", "weekend"],
    isPinned: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
    color: "#FEF3C7", // Light Yellow
  },
  {
    id: crypto.randomUUID(),
    title: "Project Ideas Q3 - Markdown",
    content: "## Project Plan\n\n1.  **Develop a new note-taking app feature**: AI summarization.\n    *   Research existing APIs\n    *   Prototype basic functionality\n2.  Learn Next.js Server Components advanced patterns.\n3.  Explore GenAI integrations for image generation based on note content.\n\n```typescript\n// Sample code snippet\nfunction greet(name: string) {\n  console.log(`Hello, ${name}!`);\n}\n```\n\n> This is a blockquote, for important reminders or quotes.",
    attachments: [
      { id: crypto.randomUUID(), name: "inspiration_moodboard.jpg", type: "image/jpeg", url: "https://placehold.co/600x400.png", dataAiHint: "abstract modern", isImage: true, file: undefined },
      { id: crypto.randomUUID(), name: "project_timeline.pdf", type: "application/pdf", url: "#", isImage: false, file: undefined },
    ],
    tags: ["tech", "development", "ideas", "Q3", "markdown"],
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), 
    color: "#DBEAFE", // Light Blue
  },
  {
    id: crypto.randomUUID(),
    title: "Book Recommendations 2024",
    content: "- Sapiens by Yuval Noah Harari\n- Atomic Habits by James Clear\n- The Three-Body Problem by Cixin Liu\n- Klara and the Sun by Kazuo Ishiguro",
    attachments: [],
    tags: ["reading", "books", "self-improvement", "fiction"],
    isPinned: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), 
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
    color: "#D1FAE5", // Light Green
  },
  {
    id: crypto.randomUUID(),
    title: "Meeting Notes - Client X",
    content: "Discussed project milestones. Client happy with progress. Next steps: finalize UI mockups.",
    attachments: [],
    tags: ["work", "client", "meeting"],
    isPinned: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 mins after creation
  },
  {
    id: crypto.randomUUID(),
    title: "Recipe: Pasta Aglio e Olio",
    content: "### Ingredients:\n- Spaghetti\n- Garlic (lots!)\n- Olive oil (good quality)\n- Red pepper flakes\n- Fresh parsley, chopped\n\n### Instructions:\n1. Cook spaghetti according to package directions until al dente.\n2. While pasta cooks, thinly slice garlic.\n3. In a large pan, heat olive oil over medium-low heat. Add garlic and red pepper flakes. Cook until garlic is golden and fragrant (be careful not to burn it!).\n4. Drain pasta, reserving about 1/2 cup of pasta water.\n5. Add cooked pasta to the pan with garlic and oil. Toss to combine. If needed, add a splash of reserved pasta water to create a light sauce.\n6. Stir in fresh parsley. Serve immediately.",
    attachments: [
       { id: crypto.randomUUID(), name: "pasta_dish.jpg", type: "image/jpeg", url: "https://placehold.co/600x400.png", dataAiHint: "pasta food", isImage: true, file: undefined },
    ],
    tags: ["recipe", "food", "cooking", "italian", "markdown"],
    isPinned: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    color: "#FEE2E2", // Light Red
  },
  {
    id: crypto.randomUUID(),
    title: "Fitness Plan - Week 1",
    content: "Mon: Chest, Tris\nTue: Back, Bis\nWed: Legs, Shoulders\nThu: Cardio\nFri: Full Body\nSat: Rest\nSun: Active Recovery",
    attachments: [],
    tags: ["health", "fitness", "workout"],
    isPinned: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Gift Ideas - Mom's Birthday",
    content: "- New gardening tools\n- Spa voucher\n- Cookbook from her favorite chef",
    attachments: [],
    tags: ["gifts", "family", "birthday"],
    isPinned: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    color: "#F3E8FF", // Light Purple
  },
  {
    id: crypto.randomUUID(),
    title: "Learning Spanish - Vocabulary",
    content: "Hola - Hello\nAdiós - Goodbye\nPor favor - Please\nGracias - Thank you\nSí - Yes\nNo - No",
    attachments: [],
    tags: ["learning", "language", "spanish"],
    isPinned: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Vacation Planning: Italy",
    content: "Cities to visit: Rome, Florence, Venice. Research flights and accommodation. Pack light!",
    attachments: [
      { id: crypto.randomUUID(), name: "italy_map.png", type: "image/png", url: "https://placehold.co/600x400.png", dataAiHint: "map illustration", isImage: true, file: undefined },
    ],
    tags: ["travel", "vacation", "planning", "italy"],
    isPinned: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    color: "#E0E7FF", // Light Indigo
  },
  {
    id: crypto.randomUUID(),
    title: "Home Renovation Ideas",
    content: "Kitchen: New countertops, backsplash. Living Room: Repaint, new sofa. Bathroom: Retile shower.",
    attachments: [],
    tags: ["home", "renovation", "ideas"],
    isPinned: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
   {
    id: crypto.randomUUID(),
    title: "Car Maintenance Log",
    content: "Oil Change: 01/03/2024\nTire Rotation: 01/03/2024\nNext Service: 01/09/2024",
    attachments: [],
    tags: ["car", "maintenance", "log"],
    isPinned: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Financial Goals 2024",
    content: "1. Save $10,000 for emergency fund.\n2. Invest in index funds.\n3. Reduce discretionary spending by 15%.",
    attachments: [],
    tags: ["finance", "goals", "budget"],
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Podcast Ideas",
    content: "- Tech trends\n- Interviews with entrepreneurs\n- Book reviews",
    attachments: [],
    tags: ["podcast", "ideas", "content creation"],
    isPinned: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    color: "#DBEAFE", // Light Blue
  },
  {
    id: crypto.randomUUID(),
    title: "Conference Notes - DevWorld 2024",
    content: "Keynote on AI in software development was insightful. Attended workshop on serverless architectures.",
    attachments: [
      { id: crypto.randomUUID(), name: "conference_badge.jpg", type: "image/jpeg", url: "https://placehold.co/400x300.png", dataAiHint: "conference badge", isImage: true, file: undefined },
    ],
    tags: ["conference", "tech", "learning", "networking"],
    isPinned: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Weekly Meal Plan",
    content: "Mon: Tacos\nTue: Salmon & Veggies\nWed: Lentil Soup\nThu: Chicken Stir-fry\nFri: Pizza Night",
    attachments: [],
    tags: ["meal plan", "food", "cooking", "organization"],
    isPinned: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    color: "#D1FAE5", // Light Green
  },
  {
    id: crypto.randomUUID(),
    title: "Gardening Log - Spring",
    content: "Planted tomatoes, cucumbers, and peppers. Watered daily. Applied organic fertilizer.",
    attachments: [],
    tags: ["gardening", "spring", "plants", "hobby"],
    isPinned: false,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Emergency Contacts",
    content: "Mom: 555-1234\nDad: 555-5678\nDoctor: 555-9012\nNeighbor: 555-3456",
    attachments: [],
    tags: ["important", "contacts", "emergency"],
    isPinned: true,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    color: "#FEE2E2", // Light Red
  },
   {
    id: crypto.randomUUID(),
    title: "Photography Ideas - Nature",
    content: "- Sunrise over mountains\n- Macro shot of a flower\n- Wildlife in its natural habitat",
    attachments: [ { id: crypto.randomUUID(), name: "camera_gear.jpg", type: "image/jpeg", url: "https://placehold.co/600x400.png", dataAiHint: "camera equipment", isImage: true, file: undefined }],
    tags: ["photography", "nature", "ideas", "hobby"],
    isPinned: false,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Software Subscriptions",
    content: "- Design Tool: $15/month\n- Code Editor Pro: $10/month\n- Cloud Storage: $5/month",
    attachments: [],
    tags: ["subscriptions", "finance", "software"],
    isPinned: false,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Presentation Outline - New Product",
    content: "1. Introduction\n2. Problem Statement\n3. Our Solution\n4. Demo\n5. Q&A",
    attachments: [],
    tags: ["work", "presentation", "product"],
    isPinned: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: crypto.randomUUID(),
    title: "Movie Watchlist",
    content: "- Dune: Part Two\n- Oppenheimer\n- Past Lives\n- Anatomy of a Fall",
    attachments: [],
    tags: ["movies", "watchlist", "entertainment"],
    isPinned: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    color: "#FEF3C7", // Light Yellow
  },
];

export default function AppWithAuth(){
  return (
    <Authenticator>
      {({user, signOut}) => (
        <Home user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

export function Home({user, signOut}) {
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
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          isPinned: note.isPinned || false,
          attachments: Array.isArray(note.attachments) ? note.attachments.map((att: any) => ({...att, isImage: att.type?.startsWith('image/') || att.isImage })) : [],
          tags: Array.isArray(note.tags) ? note.tags : [],
          color: note.color, // Load color
        } as Note)));
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setNotes(initialNotes); // Fallback to initial notes if parsing fails
      }
    } else {
      setNotes(initialNotes);
    }
    setCurrentPage(1); // Reset to first page on initial load
  }, []);

  useEffect(() => {
    if(notes.length > 0 || localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

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
      setTimeout(() => { // Simulate loading delay
        setCurrentPage(prevPage => prevPage + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, currentPage, allProcessedNotes.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset current page when search term changes
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

  const handleSaveNote = (noteData: Note, attachmentsToUpload: AttachmentFile[]) => {
    setNotes(prevNotes => {
      const existingNoteIndex = prevNotes.findIndex(n => n.id === noteData.id);
      let newNotesArray;
      if (existingNoteIndex > -1) {
        newNotesArray = [...prevNotes];
        newNotesArray[existingNoteIndex] = noteData;
      } else {
        newNotesArray = [{ ...noteData, isPinned: noteData.isPinned || false }, ...prevNotes];
      }
      return newNotesArray.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    });
    toast({
      title: noteToEdit ? "Note Updated" : "Note Created",
      description: `"${noteData.title}" has been successfully ${noteToEdit ? 'updated' : 'saved'}.`,
    });
    setIsEditorOpen(false);
    setNoteToEdit(null);
  };
  
  const handleDeleteNoteRequest = (noteId: string) => {
    setNoteToDeleteId(noteId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDeleteId) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDeleteId));
      toast({
        title: "Note Deleted",
        description: "The note has been successfully deleted.",
      });
      setNoteToDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleShareNote = (noteId: string) => {
    setNoteToShareId(noteId);
    setIsShareDialogOpen(true);
  };

  const handleTogglePinNote = (noteId: string) => {
    const noteToPin = notes.find(n => n.id === noteId);
    if (!noteToPin) return;

    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
      )
    );
    toast({
      title: `Note ${!noteToPin.isPinned ? "Pinned" : "Unpinned"}`,
      description: `"${noteToPin.title}" has been ${!noteToPin.isPinned ? 'pinned' : 'unpinned'}.`,
    });
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
