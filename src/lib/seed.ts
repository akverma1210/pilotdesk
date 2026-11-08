import { addDays, toDateKey } from './dates';
import type { WorkspaceState } from './types';

export function createSeedState(now = new Date()): WorkspaceState {
  const iso = now.toISOString();
  const yesterday = addDays(now, -1).toISOString();
  return {
    projects: [
      { id: 'project-launch', name: 'Portfolio refresh', description: 'A sharper story for my best work.', color: '#b7e878', createdAt: iso },
      { id: 'project-learn', name: 'Learning sprint', description: 'Small, consistent steps toward new skills.', color: '#a9bfff', createdAt: iso },
      { id: 'project-life', name: 'Personal admin', description: 'The little things that keep life moving.', color: '#ffc98b', createdAt: iso },
    ],
    tasks: [
      { id: 'task-1', title: 'Write the portfolio case study outline', projectId: 'project-launch', dueDate: toDateKey(now), priority: 'high', status: 'doing', estimateMinutes: 45, createdAt: iso },
      { id: 'task-2', title: 'Review responsive layouts on mobile', projectId: 'project-launch', dueDate: toDateKey(addDays(now, 1)), priority: 'medium', status: 'todo', estimateMinutes: 30, createdAt: iso },
      { id: 'task-3', title: 'Complete TypeScript generics exercise', projectId: 'project-learn', dueDate: toDateKey(now), priority: 'medium', status: 'todo', estimateMinutes: 25, createdAt: iso },
      { id: 'task-4', title: 'Organize reading list for next week', projectId: 'project-learn', dueDate: toDateKey(addDays(now, 3)), priority: 'low', status: 'todo', estimateMinutes: 20, createdAt: iso },
      { id: 'task-5', title: 'Book annual health check', projectId: 'project-life', dueDate: toDateKey(addDays(now, 2)), priority: 'medium', status: 'todo', estimateMinutes: 15, createdAt: iso },
      { id: 'task-6', title: 'Collect project screenshots', projectId: 'project-launch', dueDate: toDateKey(addDays(now, -1)), priority: 'low', status: 'done', estimateMinutes: 20, createdAt: yesterday, completedAt: iso },
      { id: 'task-7', title: 'Clear downloads folder', projectId: 'project-life', dueDate: toDateKey(now), priority: 'low', status: 'done', estimateMinutes: 10, createdAt: yesterday, completedAt: iso },
    ],
    notes: [
      { id: 'note-1', title: 'Case study ingredients', body: 'Start with the problem. Show two key decisions, one tradeoff, and the measurable result.', pinned: true, updatedAt: iso },
      { id: 'note-2', title: 'Ideas worth exploring', body: 'A weekly review template\nA tiny reading tracker\nBetter keyboard shortcuts', pinned: false, updatedAt: iso },
    ],
    focusSessions: [
      { id: 'focus-1', taskId: 'task-6', minutes: 25, completedAt: yesterday },
      { id: 'focus-2', taskId: 'task-1', minutes: 45, completedAt: iso },
    ],
    activeTaskId: 'task-1',
  };
}
