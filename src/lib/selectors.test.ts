import { describe, expect, it } from 'vitest';
import { createSeedState } from './seed';
import { filterTasks, focusMinutes, formatMinutes, projectProgress, taskStats } from './selectors';

const now = new Date();
const state = createSeedState(now);

describe('workspace selectors', () => {
  it('calculates task counts and completion rate', () => {
    const stats = taskStats(state.tasks, now);
    expect(stats).toMatchObject({ total: 7, open: 5, completed: 2, dueToday: 2, overdue: 0, completionRate: 29 });
  });

  it('filters today and searches titles', () => {
    expect(filterTasks(state.tasks, 'today', '', now).map((task) => task.id)).toEqual(['task-3', 'task-1']);
    expect(filterTasks(state.tasks, 'all', 'responsive', now).map((task) => task.id)).toEqual(['task-2']);
  });

  it('returns the next seven days in upcoming', () => {
    expect(filterTasks(state.tasks, 'upcoming', '', now).map((task) => task.id)).toEqual(['task-2', 'task-5', 'task-4']);
  });

  it('calculates project progress', () => {
    const launch = projectProgress(state.projects, state.tasks).find((project) => project.id === 'project-launch');
    expect(launch).toMatchObject({ total: 3, completed: 1, open: 2, progress: 33 });
  });

  it('formats focus time naturally', () => {
    expect(formatMinutes(25)).toBe('25m');
    expect(formatMinutes(60)).toBe('1h');
    expect(formatMinutes(95)).toBe('1h 35m');
    expect(focusMinutes(state, now)).toBe(45);
  });
});
