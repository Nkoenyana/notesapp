
"use client";

import type React from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Edit3, Trash2, Share2, MoreVertical, Paperclip, Tag, Pin, PinOff } from "lucide-react";
import type { Note } from '@/lib/types';
import ImagePreview from './ImagePreview';
import AttachmentChip from './AttachmentChip';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onShare: (noteId: string) => void;
  onTogglePinNote: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onShare, onTogglePinNote }) => {
  const imageAttachments = note.attachments.filter(att => att.isImage);
  const documentAttachments = note.attachments.filter(att => !att.isImage);

  const cardStyle = note.color ? { backgroundColor: note.color } : {};

  return (
    <Card 
      className={cn(
        "w-full shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out animate-fade-in bg-card text-card-foreground flex flex-col relative",
        note.isPinned && !note.color && "border-2 border-primary/50" // Default pin border if no color
      )}
      style={cardStyle}
    >
      <CardHeader className="pb-3 pr-10">
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1">{note.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground absolute top-2 right-2">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Note options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTogglePinNote(note.id)}>
                {note.isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                <span>{note.isPinned ? 'Unpin Note' : 'Pin Note'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(note)}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(note.id)}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Last updated: {format(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-grow min-h-[50px]">
        <div className="text-sm leading-relaxed line-clamp-3 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>
        
        {note.tags && note.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <Tag className="h-3 w-3 mr-1.5" /> Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {note.attachments.length > 0 && <div className="mt-3 pt-3 border-t">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
            <Paperclip className="h-3 w-3 mr-1.5"/> Attachments
          </h4>
          
          {imageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {imageAttachments.map(att => (
                <ImagePreview key={att.id} attachment={att} className="w-20 h-20"/>
              ))}
            </div>
          )}
          {documentAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {documentAttachments.map(att => (
                <AttachmentChip key={att.id} attachment={att} />
              ))}
            </div>
          )}
        </div>}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-3 border-t mt-auto relative">
        Created: {format(new Date(note.createdAt), "MMM d, yyyy")}
         {note.isPinned && (
          <Pin className="h-5 w-5 text-red-500 absolute bottom-3 right-3" />
        )}
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
