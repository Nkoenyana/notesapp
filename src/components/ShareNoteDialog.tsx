
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ShareNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
}

const ShareNoteDialog: React.FC<ShareNoteDialogProps> = ({ isOpen, onClose, noteId }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && noteId && typeof window !== "undefined") {
      setShareLink(`${window.location.origin}/share/note/${noteId}`);
    }
    return () => {
      setCopied(false); // Reset copied state when dialog is closed or noteId changes
    }
  }, [isOpen, noteId]);

  const handleCopyLink = async () => {
    if (!navigator.clipboard) {
      toast({
        title: "Copy failed",
        description: "Clipboard API not available in this browser.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Error",
        description: "Failed to copy the link. Please try again or copy manually.",
        variant: "destructive",
      });
      console.error('Failed to copy: ', err);
    }
  };

  if (!noteId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Share Note</DialogTitle>
          <DialogDescription>
            Anyone with this link can view this note. (This is a placeholder, sharing is not functional yet.)
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input id="share-link" value={shareLink} readOnly className="flex-1" />
          <Button type="button" size="icon" variant="outline" onClick={handleCopyLink} aria-label="Copy link">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter className="sm:justify-end mt-6">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNoteDialog;
