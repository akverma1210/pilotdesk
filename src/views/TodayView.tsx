import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock3, FolderKanban, ListTodo, NotebookPen, Play, Plus } from 'lucide-react';
import { TaskRow } from '../components/TaskRow';
import { addDays, fullDate, toDateKey } from '../lib/dates';
import { filterTasks, focusMinutes, formatMinutes, projectForTask, taskStats } from '../lib/selectors';
import type { NoteDraft, TaskStatus, View, WorkspaceState } from '../lib/types';

interface TodayViewProps {
  state: WorkspaceState;
  onNavigate: (view: View) => void;
  onNewTask: () => void;
  onToggle: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onQuickNote: (draft: NoteDraft) => void;
}

export function TodayView({ state, onNavigate, onNewTask, onToggle, onStatus, onDelete, onActivate, onQuickNote }: TodayViewProps) {
  const stats = taskStats(state.tasks);
  const activeTask = state.tasks.find((task) => task.id === state.activeTaskId && task.status !== 'done') ?? state.tasks.find((task) => task.status !== 'done');
  const activeProject = activeTask ? projectForTask(state.projects, activeTask) : undefined;
  const upcoming = filterTasks(state.tasks, 'all').filter((task) => task.status !== 'done').slice(0, 4);
  const [quickNote, setQuickNote] = useState('');
  const activity = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(now, index - 6);
      const key = toDateKey(date);
      const minutes = state.focusSessions.filter((session) => toDateKey(new Date(session.completedAt)) === key).reduce((sum, session) => sum + session.minutes, 0);
      return { key, label: date.toLocaleDateString('en-US', { weekday: 'narrow' }), minutes };
    });
  }, [state.focusSessions]);
  const maxActivity = Math.max(...activity.map((day) => day.minutes), 60);

  function saveQuickNote() {
    if (!quickNote.trim()) return;
    onQuickNote({ title: 'Quick capture', body: quickNote.trim(), pinned: false });
    setQuickNote('');
  }

  return (
    <div className="view today-view">
      <div className="view-title-row">
        <div>
          <span className="eyebrow">{fullDate()}</span>
          <h1>Make today count.</h1>
          <p>A clear plan, a quiet workspace, one good thing at a time.</p>
        </div>
        <button className="button primary" onClick={onNewTask}><Plus size={17} />New task</button>
      </div>

      <section className="stats-grid" aria-label="Workspace summary">
        <div className="stat-card"><span className="stat-icon mint"><ListTodo size={18} /></span><div><strong>{stats.open}</strong><span>Open tasks</span></div><small>{stats.dueToday} due today</small></div>
        <div className="stat-card"><span className="stat-icon blue"><CheckCircle2 size={18} /></span><div><strong>{stats.completed}</strong><span>Completed</span></div><small>{stats.completionRate}% of all tasks</small></div>
        <div className="stat-card"><span className="stat-icon peach"><Clock3 size={18} /></span><div><strong>{formatMinutes(focusMinutes(state))}</strong><span>Focus time</span></div><small>Logged today</small></div>
        <div className="stat-card"><span className="stat-icon lilac"><FolderKanban size={18} /></span><div><strong>{state.projects.length}</strong><span>Projects</span></div><small>{state.projects.length ? 'In your workspace' : 'Start your first'}</small></div>
      </section>

      <div className="today-layout">
        <div className="today-main-column">
          {activeTask ? (
            <section className="focus-card">
              <div className="focus-card-top"><span className="eyebrow">CURRENT FOCUS</span><span className="focus-status"><i />READY WHEN YOU ARE</span></div>
              <div className="focus-card-body">
                <div>
                  <h2>{activeTask.title}</h2>
                  <div className="focus-project"><span style={{ backgroundColor: activeProject?.color }} />{activeProject?.name}<b>•</b>{activeTask.estimateMinutes} min estimate</div>
                </div>
                <button className="focus-play" onClick={() => onNavigate('focus')} aria-label="Start focus session"><Play size={23} fill="currentColor" /></button>
              </div>
              <div className="focus-card-footer"><span>Small steps still move the work forward.</span><button onClick={() => onNavigate('focus')}>Open focus space <ArrowRight size={15} /></button></div>
            </section>
          ) : (
            <section className="focus-card empty-focus"><span className="eyebrow">CURRENT FOCUS</span><h2>Your next chapter starts here.</h2><p>Add a task and choose what deserves your attention.</p><button className="button primary" onClick={onNewTask}>Add your first task</button></section>
          )}

          <section className="panel up-next-panel">
            <div className="panel-heading"><div><h2>Up next</h2><span>Your clearest next steps</span></div><button className="text-button" onClick={() => onNavigate('tasks')}>All tasks <ArrowUpRight size={15} /></button></div>
            <div className="task-list">
              {upcoming.map((task) => <TaskRow key={task.id} task={task} projects={state.projects} onToggle={onToggle} onStatus={onStatus} onDelete={onDelete} onActivate={onActivate} compact />)}
              {!upcoming.length && <div className="empty-state"><CheckCircle2 size={28} /><h3>All clear</h3><p>You have no open tasks. Enjoy the breathing room.</p></div>}
            </div>
          </section>
        </div>

        <aside className="today-side-column">
          <section className="panel activity-panel">
            <div className="panel-heading"><div><h2>Focus rhythm</h2><span>Last 7 days</span></div><Clock3 size={18} /></div>
            <div className="activity-chart" aria-label="Focus minutes over the last seven days">
              {activity.map((day) => <div className="activity-day" key={day.key} title={`${day.minutes} focus minutes`}><div className="bar-track"><div className={`bar-fill ${day.key === toDateKey(new Date()) ? 'today' : ''}`} style={{ height: `${Math.max(day.minutes ? 12 : 3, (day.minutes / maxActivity) * 100)}%` }} /></div><span>{day.label}</span></div>)}
            </div>
            <div className="activity-summary"><strong>{formatMinutes(activity.reduce((sum, day) => sum + day.minutes, 0))}</strong><span>total focused time</span></div>
            <p className="gentle-note">Consistency beats intensity. A little focused time goes a long way.</p>
          </section>

          <section className="panel quick-note-panel">
            <div className="panel-heading"><div><h2>Quick capture</h2><span>Save a thought for later</span></div><NotebookPen size={18} /></div>
            <textarea value={quickNote} onChange={(event) => setQuickNote(event.target.value)} placeholder="An idea, a reminder, anything..." aria-label="Quick note" rows={4} maxLength={500} />
            <div className="quick-note-footer"><span>{quickNote.length}/500</span><button className="button small secondary" disabled={!quickNote.trim()} onClick={saveQuickNote}>Save note <ArrowRight size={14} /></button></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
