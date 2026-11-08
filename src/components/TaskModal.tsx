import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { toDateKey } from '../lib/dates';
import type { Project, TaskDraft } from '../lib/types';

interface TaskModalProps {
  projects: Project[];
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
}

export function TaskModal({ projects, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(toDateKey(new Date()));
  const [priority, setPriority] = useState<TaskDraft['priority']>('medium');
  const [estimateMinutes, setEstimateMinutes] = useState(25);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !projectId) return;
    onSave({ title: title.trim(), projectId, dueDate, priority, estimateMinutes });
  }

  return (
    <Modal title="Add a task" eyebrow="MAKE IT ACTIONABLE" onClose={onClose}>
      <form onSubmit={submit} className="form-stack">
        <label className="field full-field">
          <span>What needs to get done?</span>
          <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Write a clear next step" required maxLength={160} />
        </label>
        <div className="form-grid">
          <label className="field">
            <span>Project</span>
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} required>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Due date</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
          </label>
          <label className="field">
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as TaskDraft['priority'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span>Estimate</span>
            <select value={estimateMinutes} onChange={(event) => setEstimateMinutes(Number(event.target.value))}>
              <option value={15}>15 minutes</option>
              <option value={25}>25 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" type="submit">Add task</button>
        </div>
      </form>
    </Modal>
  );
}
