import { client } from '@/lib/amplify-client';
import type { Note, Attachment, AttachmentFile } from '@/lib/types';
import { initialNotes } from '@/lib/initial-notes';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

const isAmplify = process.env.NEXT_PUBLIC_DATA_SOURCE === 'amplify';
const NOTES_KEY = 'notes';

// #region Helper Functions
function serializeNotes(notes: Note[]): string {
    return JSON.stringify(notes.map(note => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        attachments: note.attachments.map(att => ({
            id: att.id,
            name: att.name,
            type: att.type,
            url: att.url,
            isImage: att.isImage
        }))
    })));
}

function deserializeNotes(jsonString: string): Note[] {
    if (!jsonString) return [];
    return JSON.parse(jsonString).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
    }));
}

function getLocalNotes(): Note[] {
    if (typeof window === 'undefined') return [];
    const storedNotes = localStorage.getItem(NOTES_KEY);
    return storedNotes ? deserializeNotes(storedNotes) : initialNotes;
}

function saveLocalNotes(notes: Note[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTES_KEY, serializeNotes(notes));
}

async function mapAmplifyNoteToAppNote(amplifyNote: any): Promise<Note> {
    const attachmentPromises = (amplifyNote.attachments || []).map(async (path: string, index: number): Promise<Attachment> => {
        try {
            const getUrlResult = await getUrl({ path, options: { validateObjectExistence: true, expiresIn: 3600 } });
            const name = path.substring(path.lastIndexOf('/') + 1).split('-').slice(1).join('-');
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
            return {
                id: `${amplifyNote.id}-att-${index}`,
                name: name,
                type: isImage ? 'image/jpeg' : 'application/octet-stream', 
                url: getUrlResult.url.toString(),
                isImage: isImage,
                // Store the original path for potential delete operations
                file: { s3Path: path } as any
            };
        } catch (error) {
            console.error(`Error getting URL for path ${path}:`, error);
            const name = path.substring(path.lastIndexOf('/') + 1);
            return {
                id: `${amplifyNote.id}-att-${index}`,
                name: `(Unavailable) ${name}`,
                type: 'application/octet-stream',
                url: '#',
                isImage: false,
            };
        }
    });

    const resolvedAttachments = await Promise.all(attachmentPromises);

    return {
        id: amplifyNote.id,
        title: amplifyNote.title,
        content: amplifyNote.content,
        tags: amplifyNote.tags || [],
        isPinned: amplifyNote.isPinned || false,
        color: amplifyNote.color || undefined,
        createdAt: new Date(amplifyNote.createdAt),
        updatedAt: new Date(amplifyNote.updatedAt),
        attachments: resolvedAttachments
    };
}
// #endregion

// #region Public API
export function subscribeToNotes(callbacks: { next: (notes: Note[]) => void, error: (e: any) => void }): { unsubscribe: () => void } {
    if (isAmplify) {
        const sub = client.models.Note.observeQuery().subscribe({
            next: async ({ items }) => {
                try {
                    const notesWithUrls = await Promise.all(items.map(mapAmplifyNoteToAppNote));
                    callbacks.next(notesWithUrls);
                } catch (error) {
                    callbacks.error(error);
                }
            },
            error: callbacks.error
        });
        return sub;
    } else {
        try {
            callbacks.next(getLocalNotes());
        } catch (error) {
            callbacks.error(error);
        }
        return { unsubscribe: () => {} };
    }
}

export async function getNoteById(id: string): Promise<Note | null> {
    if (isAmplify) {
        const { data: note, errors } = await client.models.Note.get({ id });
        if (errors) throw errors;
        if (!note) return null;
        return await mapAmplifyNoteToAppNote(note);
    } else {
        const notes = getLocalNotes();
        const note = notes.find(n => n.id === id) || null;
        return Promise.resolve(note);
    }
}

export async function saveNote(noteData: Note, attachmentsToUpload: AttachmentFile[]): Promise<void> {
    if (isAmplify) {
        const { data: originalNote } = await client.models.Note.get({ id: noteData.id });
        const originalAttachmentPaths = originalNote?.attachments || [];

        const newAttachmentPaths = await Promise.all(
            attachmentsToUpload.map(async (file) => {
                const path = `protected/{user_identity_id}/${crypto.randomUUID()}-${file.name}`;
                try {
                    const result = await uploadData({ path, data: file }).result;
                    return result.path;
                } catch (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    return null;
                }
            })
        );
        const validNewPaths = newAttachmentPaths.filter(Boolean) as string[];

        const keptAttachmentPaths = noteData.attachments
            .filter(att => att.file && (att.file as any).s3Path)
            .map(att => (att.file as any).s3Path);

        const finalAttachmentPaths = [...keptAttachmentPaths, ...validNewPaths];

        const pathsToDelete = originalAttachmentPaths.filter(p => !finalAttachmentPaths.includes(p));
        if (pathsToDelete.length > 0) {
            await Promise.all(
                pathsToDelete.map(path => remove({ path }).catch(e => console.error(`Failed to delete removed attachment ${path}`, e)))
            );
        }
        
        const noteInput = {
            id: noteData.id,
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags,
            isPinned: noteData.isPinned,
            color: noteData.color,
            attachments: finalAttachmentPaths,
        };
        
        if (originalNote) {
            await client.models.Note.update(noteInput);
        } else {
            await client.models.Note.create(noteInput);
        }
    } else {
        const notes = getLocalNotes();
        const existingNoteIndex = notes.findIndex(n => n.id === noteData.id);
        if (existingNoteIndex > -1) {
            notes[existingNoteIndex] = noteData;
        } else {
            notes.unshift(noteData);
        }
        saveLocalNotes(notes);
    }
}

export async function deleteNote(noteId: string): Promise<void> {
    if (isAmplify) {
        const { data: noteToDelete } = await client.models.Note.get({ id: noteId });
        if (noteToDelete && noteToDelete.attachments && noteToDelete.attachments.length > 0) {
            await Promise.all(
                noteToDelete.attachments.map(path => 
                    remove({ path }).catch(e => console.error(`Failed to delete S3 object ${path}`, e))
                )
            );
        }
        await client.models.Note.delete({ id: noteId });
    } else {
        let notes = getLocalNotes();
        notes = notes.filter(note => note.id !== noteId);
        saveLocalNotes(notes);
    }
}

export async function togglePin(noteId: string, isPinned: boolean): Promise<void> {
     if (isAmplify) {
        await client.models.Note.update({ id: noteId, isPinned });
    } else {
        const notes = getLocalNotes();
        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            notes[noteIndex].isPinned = isPinned;
            notes[noteIndex].updatedAt = new Date();
            saveLocalNotes(notes);
        }
    }
}
// #endregion
