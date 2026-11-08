import { addDays, toDateKey } from './dates';
import type { Project, Task, TaskFilter, WorkspaceState } from './types';

export function projectForTask(projects: Project[], task: Task): Project | undefined {
  return projects.find((project) => project.id === task.projectId);
}

export function taskStats(tasks: Task[], now = new Date()) {
  const today = toDateKey(now);
  const completed = tasks.filter((task) => task.status === 'done').length;
  const open = tasks.length - completed;
  const dueToday = tasks.filter((task) => task.status !== 'done' && task.dueDate === today).length;
  const overdue = tasks.filter((task) => task.status !== 'done' && task.dueDate < today).length;
  return {
    total: tasks.length,
    open,
    completed,
    dueToday,
    overdue,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

export function filterTasks(tasks: Task[], filter: TaskFilter, query = '', now = new Date()): Task[] {
  const today = toDateKey(now);
  const normalizedQuery = query.trim().toLowerCase();
  return tasks
    .filter((task) => {
      if (filter === 'today') return task.status !== 'done' && task.dueDate <= today;
      if (filter === 'upcoming') return task.status !== 'done' && task.dueDate > today && task.dueDate <= toDateKey(addDays(now, 7));
      if (filter === 'completed') return task.status === 'done';
      return true;
    })
    .filter((task) => !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1;
      return a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title);
    });
}

export function projectProgress(projects: Project[], tasks: Task[]) {
  return projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const completed = projectTasks.filter((task) => task.status === 'done').length;
    return {
      ...project,
      total: projectTasks.length,
      completed,
      open: projectTasks.length - completed,
      progress: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
      nextTask: projectTasks.find((task) => task.status !== 'done'),
    };
  });
}

export function focusMinutes(state: WorkspaceState, now = new Date()): number {
  const today = toDateKey(now);
  return state.focusSessions
    .filter((session) => toDateKey(new Date(session.completedAt)) === today)
    .reduce((sum, session) => sum + session.minutes, 0);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
