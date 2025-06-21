
"use client";

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadCloud, Palette, CheckCircle } from 'lucide-react';
import type { Note, Attachment, AttachmentFile } from '@/lib/types';
import ImagePreview from './ImagePreview';
import AttachmentChip from './AttachmentChip';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  content: z.string().min(1, 'Content is required'),
  tags: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note, attachmentsToUpload: AttachmentFile[]) => void;
  noteToEdit?: Note | null;
}

const PREDEFINED_COLORS = [
  { name: 'Default', value: undefined },
  { name: 'Rose', value: '#FFE4E6' }, // bg-rose-100
  { name: 'Yellow', value: '#FEF9C3' }, // bg-yellow-100
  { name: 'Green', value: '#D1FAE5' },  // bg-green-200
  { name: 'Blue', value: '#DBEAFE' },   // bg-blue-200
  { name: 'Indigo', value: '#E0E7FF' }, // bg-indigo-200
  { name: 'Purple', value: '#F3E8FF' }, // bg-purple-200
  { name: 'Pink', value: '#FCE7F3' },   // bg-pink-100
];


const NoteEditorDialog: React.FC<NoteEditorDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  noteToEdit,
}) => {
  const { toast } = useToast();
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<AttachmentFile[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', content: '', tags: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        reset({ 
          title: noteToEdit.title, 
          content: noteToEdit.content,
          tags: noteToEdit.tags?.join(', ') || '' 
        });
        setCurrentAttachments(noteToEdit.attachments || []);
        setSelectedColor(noteToEdit.color);
        setFilesToUpload([]); 
      } else {
        reset({ title: '', content: '', tags: '' });
        setCurrentAttachments([]);
        setSelectedColor(PREDEFINED_COLORS[0].value); // Default to first color (undefined)
        setFilesToUpload([]);
      }
    }
  }, [noteToEdit, isOpen, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = [];
      const newFilesToUpload: AttachmentFile[] = [];

      Array.from(files).forEach(file => {
        const id = crypto.randomUUID();
        const isImage = file.type.startsWith('image/');
        const attachment: Attachment = {
          id,
          name: file.name,
          type: file.type,
          isImage,
          file: Object.assign(file, { preview: isImage ? URL.createObjectURL(file) : undefined }) as AttachmentFile,
        };
        newAttachments.push(attachment);
        newFilesToUpload.push(attachment.file as AttachmentFile);
      });
      setCurrentAttachments(prev => [...prev, ...newAttachments]);
      setFilesToUpload(prev => [...prev, ...newFilesToUpload]);
    }
     if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
    }
  };

  const removeAttachment = (idToRemove: string) => {
    const removedAttachment = currentAttachments.find(att => att.id === idToRemove);
    if (removedAttachment?.isImage && removedAttachment.file?.preview) {
      URL.revokeObjectURL(removedAttachment.file.preview);
    }
    setCurrentAttachments(prev => prev.filter(att => att.id !== idToRemove));
    setFilesToUpload(prev => prev.filter(file => {
      return removedAttachment?.file?.name !== file.name || (removedAttachment?.file?.preview && removedAttachment?.file?.preview !== file.preview);
    }));
  };

  const onSubmit = (data: NoteFormData) => {
    const now = new Date();
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const noteData: Note = {
      id: noteToEdit?.id || crypto.randomUUID(),
      title: data.title,
      content: data.content,
      tags: tagsArray,
      attachments: currentAttachments.map(att => ({ 
          id: att.id,
          name: att.name,
          type: att.type,
          isImage: att.isImage,
          url: att.file?.preview || att.url, 
      })),
      isPinned: noteToEdit?.isPinned || false,
      createdAt: noteToEdit?.createdAt || now,
      updatedAt: now,
      color: selectedColor,
    };
    onSave(noteData, filesToUpload);
    onCloseDialog();
  };
  
  const onCloseDialog = () => {
    currentAttachments.forEach(att => {
      if (att.isImage && att.file?.preview) {
        URL.revokeObjectURL(att.file.preview);
      }
    });
    reset(); 
    setCurrentAttachments([]); 
    setFilesToUpload([]);
    setSelectedColor(PREDEFINED_COLORS[0].value);
    onClose(); 
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">
            {noteToEdit ? 'Edit Note' : 'Create New Note'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto px-6">
          <form onSubmit={handleSubmit(onSubmit)} id="note-editor-form" className="space-y-6 py-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input id="title" {...field} className="mt-1" aria-invalid={!!errors.title} />
                )}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium">Content (Markdown supported)</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="content"
                    {...field}
                    rows={8}
                    className="mt-1 resize-none"
                    aria-invalid={!!errors.content}
                    placeholder="Type your note here. You can use Markdown for formatting."
                  />
                )}
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Input id="tags" {...field} className="mt-1" placeholder="e.g. work, personal, important" />
                )}
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center"><Palette className="w-4 h-4 mr-2 text-muted-foreground"/> Note Color</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREDEFINED_COLORS.map(color => (
                  <button
                    type="button"
                    key={color.name}
                    title={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center",
                      selectedColor === color.value ? 'border-primary' : 'border-muted hover:border-foreground/50',
                      !color.value && 'bg-background border-dashed' // Style for default/no color
                    )}
                    style={color.value ? { backgroundColor: color.value } : {}}
                    aria-label={`Select ${color.name} color`}
                  >
                    {selectedColor === color.value && <CheckCircle className="w-5 h-5 text-primary-foreground mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Attachments</Label>
              <div
                className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                tabIndex={0}
                role="button"
                aria-label="Add attachments"
              >
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Images, PDFs, Documents, etc.</p>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />
              </div>
            </div>

            {currentAttachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Attached files:</h3>
                <div className="flex flex-wrap gap-3">
                  {currentAttachments.map((att) =>
                    att.isImage ? (
                      <ImagePreview key={att.id} attachment={att} onRemove={() => removeAttachment(att.id)} />
                    ) : (
                      <AttachmentChip key={att.id} attachment={att} onRemove={() => removeAttachment(att.id)} />
                    )
                  )}
                </div>
              </div>
            )}
            {noteToEdit && (
              <div className="text-xs text-muted-foreground space-x-2">
                <span>Created: {format(new Date(noteToEdit.createdAt), "PPp")}</span>
                <span>Last Modified: {format(new Date(noteToEdit.updatedAt), "PPp")}</span>
              </div>
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-0 border-t mt-auto">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCloseDialog}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="note-editor-form" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? 'Saving...' : (noteToEdit ? 'Save Changes' : 'Create Note')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorDialog;
