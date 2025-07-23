"use client";

import type React from 'react';
import { Badge } from "@/components/ui/badge";
import { FileText, Paperclip } from "lucide-react";
import type { Attachment } from '@/lib/types';

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove?: () => void;
}

const AttachmentChip: React.FC<AttachmentChipProps> = ({ attachment, onRemove }) => {
  const Icon = attachment.isImage ? Paperclip : FileText; // Fallback, usually images are handled by ImagePreview
  const filename = attachment.name.match(/[^-]+\.[a-zA-Z]+$/)[0];
  return (
    <Badge variant="secondary" className="flex items-center space-x-2 p-2 pr-3 text-sm bg-muted text-muted-foreground rounded-full">
      <Icon className="h-4 w-4" />
      <span className="truncate max-w-[150px]">{filename}</span>
      {onRemove && (
         <button 
            type="button" 
            onClick={onRemove} 
            className="ml-2 text-muted-foreground hover:text-destructive focus:outline-none"
            aria-label={`Remove ${filename}`}
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
         </button>
      )}
    </Badge>
  );
};

export default AttachmentChip;
