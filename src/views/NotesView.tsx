import { Edit3, Pin, PinOff, Plus, StickyNote, Trash2 } from 'lucide-react';
import type { Note, WorkspaceState } from '../lib/types';

interface NotesViewProps {
  state: WorkspaceState;
  onNewNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onPinNote: (id: string) => void;
}

export function NotesView({ state, onNewNote, onEditNote, onDeleteNote, onPinNote }: NotesViewProps) {
  const notes = [...state.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  return (
    <div className="view notes-view">
      <div className="view-title-row">
        <div><span className="eyebrow">YOUR NOTEBOOK</span><h1>Keep the thoughts worth keeping.</h1><p>A quiet place for ideas, decisions and useful loose ends.</p></div>
        <button className="button primary" onClick={onNewNote}><Plus size={17} />New note</button>
      </div>
      <div className="notes-grid">
        {notes.map((note) => (
          <article className={`note-card ${note.pinned ? 'pinned' : ''}`} key={note.id}>
            <div className="note-top"><span className="note-icon"><StickyNote size={18} /></span><div className="note-actions"><button className="icon-button" onClick={() => onPinNote(note.id)} aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}>{note.pinned ? <PinOff size={16} /> : <Pin size={16} />}</button><button className="icon-button" onClick={() => onDeleteNote(note.id)} aria-label={`Delete ${note.title}`}><Trash2 size={16} /></button></div></div>
            {note.pinned && <span className="pinned-label"><Pin size={11} />PINNED</span>}
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            <div className="note-footer"><span>{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><button className="text-button" onClick={() => onEditNote(note)}><Edit3 size={14} />Edit note</button></div>
          </article>
        ))}
        <button className="new-note-card" onClick={onNewNote}><Plus size={25} /><span>Capture a new thought</span></button>
      </div>
      {!notes.length && <div className="empty-state notebook-empty"><StickyNote size={34} /><h3>Your notebook is open</h3><p>Write your first note and give an idea somewhere to land.</p></div>}
    </div>
  );
}
