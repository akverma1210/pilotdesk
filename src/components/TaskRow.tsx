import { Check, Clock3, Trash2 } from 'lucide-react';
import { dueLabel } from '../lib/dates';
import { projectForTask } from '../lib/selectors';
import type { Project, Task, TaskStatus } from '../lib/types';

interface TaskRowProps {
  task: Task;
  projects: Project[];
  onToggle: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  compact?: boolean;
}

export function TaskRow({ task, projects, onToggle, onStatus, onDelete, onActivate, compact = false }: TaskRowProps) {
  const project = projectForTask(projects, task);
  const done = task.status === 'done';
  return (
    <article className={`task-row ${done ? 'is-done' : ''}`} data-testid={`task-${task.id}`}>
      <button className={`task-check ${done ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}>
        {done && <Check size={14} strokeWidth={3} />}
      </button>
      <button className="task-main" onClick={() => onActivate(task.id)} title="Set as current focus">
        <span className="task-title">{task.title}</span>
        <span className="task-project"><i style={{ backgroundColor: project?.color }} />{project?.name ?? 'Unassigned'}</span>
      </button>
      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        <span className={`due ${dueLabel(task.dueDate) === 'Overdue' && !done ? 'overdue' : ''}`}><Clock3 size={13} />{dueLabel(task.dueDate)}</span>
        <span className="estimate">{task.estimateMinutes}m</span>
      </div>
      {!compact && (
        <select className="status-select" aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onStatus(task.id, event.target.value as TaskStatus)}>
          <option value="todo">To do</option>
          <option value="doing">In progress</option>
          <option value="done">Done</option>
        </select>
      )}
      <button className="delete-button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button>
    </article>
  );
}
