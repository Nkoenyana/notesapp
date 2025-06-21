
export interface AttachmentFile extends File {
  preview?: string; // For image previews
}
export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type or a general category like 'image', 'document'
  url?: string; // URL for persisted files, or preview for local files
  file?: AttachmentFile; // The actual file object for new attachments
  isImage: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  tags?: string[];
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  color?: string; // Added for note color selection
}
