import { createSeedState } from './seed';
import { createId } from './id';
import { toDateKey } from './dates';
import type { NoteDraft, ProjectDraft, TaskDraft, TaskStatus, WorkspaceState } from './types';

export type WorkspaceAction =
  | { type: 'task/add'; draft: TaskDraft; now?: string }
  | { type: 'task/toggle'; id: string; now?: string }
  | { type: 'task/status'; id: string; status: TaskStatus; now?: string }
  | { type: 'task/delete'; id: string }
  | { type: 'task/activate'; id?: string }
  | { type: 'project/add'; draft: ProjectDraft }
  | { type: 'note/add'; draft: NoteDraft }
  | { type: 'note/update'; id: string; draft: NoteDraft }
  | { type: 'note/delete'; id: string }
  | { type: 'note/pin'; id: string }
  | { type: 'focus/log'; minutes: number; taskId?: string; now?: string }
  | { type: 'workspace/replace'; state: WorkspaceState };

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'task/add': {
      const now = action.now ?? new Date().toISOString();
      return {
        ...state,
        tasks: [{ id: createId('task'), ...action.draft, status: 'todo', createdAt: now }, ...state.tasks],
      };
    }
    case 'task/toggle': {
      const now = action.now ?? new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === action.id
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done', completedAt: task.status === 'done' ? undefined : now }
          : task),
      };
    }
    case 'task/status': {
      const now = action.now ?? new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === action.id
          ? { ...task, status: action.status, completedAt: action.status === 'done' ? (task.completedAt ?? now) : undefined }
          : task),
      };
    }
    case 'task/delete':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        activeTaskId: state.activeTaskId === action.id ? undefined : state.activeTaskId,
      };
    case 'task/activate':
      return { ...state, activeTaskId: action.id };
    case 'project/add':
      return {
        ...state,
        projects: [...state.projects, { id: createId('project'), ...action.draft, createdAt: new Date().toISOString() }],
      };
    case 'note/add':
      return {
        ...state,
        notes: [{ id: createId('note'), ...action.draft, updatedAt: new Date().toISOString() }, ...state.notes],
      };
    case 'note/update':
      return {
        ...state,
        notes: state.notes.map((note) => note.id === action.id
          ? { ...note, ...action.draft, updatedAt: new Date().toISOString() }
          : note),
      };
    case 'note/delete':
      return { ...state, notes: state.notes.filter((note) => note.id !== action.id) };
    case 'note/pin':
      return {
        ...state,
        notes: state.notes.map((note) => note.id === action.id ? { ...note, pinned: !note.pinned } : note),
      };
    case 'focus/log':
      return {
        ...state,
        focusSessions: [{ id: createId('focus'), minutes: action.minutes, taskId: action.taskId, completedAt: action.now ?? new Date().toISOString() }, ...state.focusSessions],
      };
    case 'workspace/replace':
      return action.state;
    default:
      return state;
  }
}

const STORAGE_KEY = 'pilotdesk.workspace.v1';

export function loadWorkspace(storage?: Storage): WorkspaceState {
  if (!storage) return createSeedState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.notes) || !Array.isArray(parsed.focusSessions)) {
      return createSeedState();
    }
    return parsed as WorkspaceState;
  } catch {
    return createSeedState();
  }
}

export function saveWorkspace(state: WorkspaceState, storage?: Storage): void {
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportWorkspace(state: WorkspaceState): string {
  return JSON.stringify({ app: 'PilotDesk', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function importWorkspace(raw: string): WorkspaceState {
  const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
  if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.notes) || !Array.isArray(parsed.focusSessions)) {
    throw new Error('This file is not a valid PilotDesk backup.');
  }
  return {
    tasks: parsed.tasks,
    projects: parsed.projects,
    notes: parsed.notes,
    focusSessions: parsed.focusSessions,
    activeTaskId: parsed.activeTaskId,
  };
}

export function isDueToday(dueDate: string, now = new Date()): boolean {
  return dueDate === toDateKey(now);
}
