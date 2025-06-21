"use client";

import type React from 'react';
import Image from 'next/image';
import type { Attachment } from '@/lib/types';

interface ImagePreviewProps {
  attachment: Attachment;
  onRemove?: () => void;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ attachment, onRemove, className }) => {
  const src = attachment.url || (attachment.file?.preview);

  if (!src) return null;

  return (
    <div className={`relative group w-32 h-32 rounded-md overflow-hidden border ${className}`}>
      <Image 
        src={src} 
        alt={attachment.name} 
        width={128} 
        height={128} 
        className="object-cover w-full h-full"
        data-ai-hint="abstract texture" 
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive"
          aria-label={`Remove ${attachment.name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
};

export default ImagePreview;
