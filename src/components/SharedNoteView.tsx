import type React from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Paperclip, Tag } from "lucide-react";
import type { Note } from '@/lib/types';
import ImagePreview from './ImagePreview';
import AttachmentChip from './AttachmentChip';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface SharedNoteViewProps {
  note: Note;
}

const SharedNoteView: React.FC<SharedNoteViewProps> = ({ note }) => {
  const imageAttachments = note.attachments?.filter(att => att.isImage) || [];
  const documentAttachments = note.attachments?.filter(att => !att.isImage) || [];

  const cardStyle = note.color ? { backgroundColor: note.color, border: 'none' } : {};

  return (
    <Card 
      className={cn(
        "w-full max-w-4xl mx-auto shadow-xl flex flex-col",
        note.isPinned && !note.color && "border-2 border-primary/50"
      )}
      style={cardStyle}
    >
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-3xl mb-1">{note.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Created: {format(new Date(note.createdAt), "MMMM d, yyyy")} &bull; Last updated: {format(new Date(note.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 flex-grow">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>
      </CardContent>
      
      {(note.tags && note.tags.length > 0) || (note.attachments && note.attachments.length > 0) ? (
        <CardFooter className="flex-col items-start gap-6 pt-6 border-t">
          {note.tags && note.tags.length > 0 && (
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" /> Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {note.attachments && note.attachments.length > 0 && (
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <Paperclip className="h-4 w-4 mr-2"/> Attachments
              </h4>
              
              {imageAttachments.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-2">
                  {imageAttachments.map(att => (
                    <ImagePreview key={att.id} attachment={att} className="w-40 h-40"/>
                  ))}
                </div>
              )}
              {documentAttachments.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {documentAttachments.map(att => (
                    <AttachmentChip key={att.id} attachment={att} />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default SharedNoteView;
