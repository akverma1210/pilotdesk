import { describe, expect, it } from 'vitest';
import { createSeedState } from './seed';
import { exportWorkspace, importWorkspace, loadWorkspace, saveWorkspace, workspaceReducer } from './store';
import { toDateKey } from './dates';

const now = '2026-11-09T10:00:00.000Z';

describe('workspace reducer', () => {
  it('adds a task with safe defaults', () => {
    const state = createSeedState();
    const next = workspaceReducer(state, {
      type: 'task/add',
      draft: { title: 'Ship the release', projectId: 'project-launch', dueDate: '2026-11-10', priority: 'high', estimateMinutes: 30 },
      now,
    });
    expect(next.tasks[0]).toMatchObject({ title: 'Ship the release', status: 'todo', estimateMinutes: 30, createdAt: now });
    expect(next.tasks).toHaveLength(state.tasks.length + 1);
  });

  it('completes and reopens a task without losing its identity', () => {
    const state = createSeedState();
    const completed = workspaceReducer(state, { type: 'task/toggle', id: 'task-1', now });
    expect(completed.tasks.find((task) => task.id === 'task-1')).toMatchObject({ status: 'done', completedAt: now });
    const reopened = workspaceReducer(completed, { type: 'task/toggle', id: 'task-1' });
    expect(reopened.tasks.find((task) => task.id === 'task-1')).toMatchObject({ status: 'todo', completedAt: undefined });
  });

  it('clears the active task when it is deleted', () => {
    const state = createSeedState();
    const next = workspaceReducer(state, { type: 'task/delete', id: 'task-1' });
    expect(next.activeTaskId).toBeUndefined();
    expect(next.tasks.some((task) => task.id === 'task-1')).toBe(false);
  });

  it('adds and pins notes', () => {
    const state = createSeedState();
    const withNote = workspaceReducer(state, { type: 'note/add', draft: { title: 'New idea', body: 'Keep it simple.', pinned: false } });
    const id = withNote.notes[0].id;
    const pinned = workspaceReducer(withNote, { type: 'note/pin', id });
    expect(pinned.notes.find((note) => note.id === id)?.pinned).toBe(true);
  });

  it('logs a focus session', () => {
    const state = createSeedState();
    const next = workspaceReducer(state, { type: 'focus/log', minutes: 25, taskId: 'task-1', now });
    expect(next.focusSessions[0]).toMatchObject({ minutes: 25, taskId: 'task-1', completedAt: now });
  });
});

describe('persistence', () => {
  it('round-trips state through storage', () => {
    const state = createSeedState();
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } } as unknown as Storage;
    saveWorkspace(state, storage);
    expect(loadWorkspace(storage)).toEqual(state);
  });

  it('falls back to a usable workspace for corrupt data', () => {
    const storage = { getItem: () => '{not-json' } as unknown as Storage;
    const state = loadWorkspace(storage);
    expect(state.tasks.length).toBeGreaterThan(0);
    expect(state.projects.length).toBeGreaterThan(0);
  });

  it('exports and imports a backup', () => {
    const state = createSeedState();
    expect(importWorkspace(exportWorkspace(state))).toEqual(state);
    expect(() => importWorkspace('{"tasks":[]}')).toThrow('valid PilotDesk backup');
  });

  it('uses local calendar dates for due dates', () => {
    const date = new Date(2026, 10, 9, 23, 30);
    expect(toDateKey(date)).toBe('2026-11-09');
  });
});
