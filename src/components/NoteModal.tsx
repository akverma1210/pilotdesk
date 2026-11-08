import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import type { Note, NoteDraft } from '../lib/types';

interface NoteModalProps {
  note?: Note;
  onClose: () => void;
  onSave: (draft: NoteDraft) => void;
}

export function NoteModal({ note, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [pinned, setPinned] = useState(note?.pinned ?? false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave({ title: title.trim(), body: body.trim(), pinned });
  }

  return (
    <Modal title={note ? 'Edit note' : 'Capture a thought'} eyebrow="YOUR NOTEBOOK" onClose={onClose} wide>
      <form onSubmit={submit} className="form-stack">
        <label className="field full-field">
          <span>Title</span>
          <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this note a name" required maxLength={120} />
        </label>
        <label className="field full-field">
          <span>Note</span>
          <textarea className="note-textarea" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write it down before it gets away..." required rows={8} />
        </label>
        <label className="check-label">
          <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} />
          Keep this note pinned
        </label>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" type="submit">{note ? 'Save changes' : 'Save note'}</button>
        </div>
      </form>
    </Modal>
  );
}
