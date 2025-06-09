

export function NoteItem({ note, client, fetchNotes }) {
    async function deleteNote() {
        await client.models.Note.delete(note.id)
        .then(() => {
            fetchNotes();
        })
        .catch((error) => {
            console.error("Error deleting note:", error);
        });
    }
    
    async function softDeleteNote() {
        await client.models.Note.update(note.id, { deleted: true })
        .then(() => {
            fetchNotes();
        })
        .catch((error) => {
            console.error("Error soft deleting note:", error);
        });
    }

    return (
        <div className="note-item">
        <h3>{note.name}</h3>
        <p>{note.description}</p>
        {note.image && (
            <img
            src={client.storage.getUrl({ key: note.image })}
            alt={note.name}
            className="note-image"
            />
        )}
        <button onClick={deleteNote}>Delete</button>
        </div>
    );
    }