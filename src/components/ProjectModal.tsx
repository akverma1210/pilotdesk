import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import type { ProjectDraft } from '../lib/types';

const colors = ['#b7e878', '#a9bfff', '#ffc98b', '#e8a7c3', '#8edbd2'];

export function ProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (draft: ProjectDraft) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colors[0]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || 'A space for focused progress.', color });
  }

  return (
    <Modal title="Start a project" eyebrow="MAKE ROOM FOR PROGRESS" onClose={onClose}>
      <form onSubmit={submit} className="form-stack">
        <label className="field full-field">
          <span>Project name</span>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="What are you working toward?" required maxLength={80} />
        </label>
        <label className="field full-field">
          <span>Short description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does done look like?" rows={3} maxLength={180} />
        </label>
        <fieldset className="color-field">
          <legend>Project color</legend>
          <div className="color-options">
            {colors.map((option) => (
              <button key={option} type="button" aria-label={`Choose color ${option}`} aria-pressed={color === option} className={`color-swatch ${color === option ? 'selected' : ''}`} style={{ backgroundColor: option }} onClick={() => setColor(option)} />
            ))}
          </div>
        </fieldset>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" type="submit">Create project</button>
        </div>
      </form>
    </Modal>
  );
}
