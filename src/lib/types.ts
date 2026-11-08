export type View = 'today' | 'tasks' | 'projects' | 'notes' | 'focus';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  estimateMinutes: number;
  createdAt: string;
  completedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  minutes: number;
  completedAt: string;
}

export interface WorkspaceState {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  focusSessions: FocusSession[];
  activeTaskId?: string;
}

export interface TaskDraft {
  title: string;
  projectId: string;
  dueDate: string;
  priority: Priority;
  estimateMinutes: number;
}

export interface NoteDraft {
  title: string;
  body: string;
  pinned: boolean;
}

export interface ProjectDraft {
  name: string;
  description: string;
  color: string;
}
