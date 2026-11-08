import { useEffect, useMemo, useState } from 'react';
import { Check, Clock3, Pause, Play, RotateCcw } from 'lucide-react';
import { shortTime } from '../lib/dates';
import { formatMinutes, projectForTask } from '../lib/selectors';
import type { WorkspaceState } from '../lib/types';

interface FocusViewProps {
  state: WorkspaceState;
  onSelectTask: (id?: string) => void;
  onLogSession: (minutes: number, taskId?: string) => void;
}

const presets = [15, 25, 45];

export function FocusView({ state, onSelectTask, onLogSession }: FocusViewProps) {
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const openTasks = state.tasks.filter((task) => task.status !== 'done');
  const activeTask = openTasks.find((task) => task.id === state.activeTaskId);
  const project = activeTask ? projectForTask(state.projects, activeTask) : undefined;
  const circumference = 2 * Math.PI * 126;
  const elapsed = duration - remaining;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      onLogSession(Math.round(duration / 60), activeTask?.id);
    }
  }, [remaining, running, duration, activeTask?.id, onLogSession]);

  const recent = useMemo(() => state.focusSessions.slice(0, 5), [state.focusSessions]);

  function choosePreset(minutes: number) {
    setRunning(false);
    setDuration(minutes * 60);
    setRemaining(minutes * 60);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  function logElapsed() {
    const minutes = Math.floor(elapsed / 60);
    if (minutes < 1) return;
    onLogSession(minutes, activeTask?.id);
    reset();
  }

  const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="view focus-view">
      <div className="view-title-row">
        <div><span className="eyebrow">DISTRACTION-FREE ZONE</span><h1>One thing. Full attention.</h1><p>Choose a task, set a timer and give the work some room.</p></div>
      </div>
      <div className="focus-layout">
        <section className="focus-timer-card">
          <div className="preset-tabs" aria-label="Timer length">{presets.map((preset) => <button key={preset} className={duration === preset * 60 ? 'active' : ''} onClick={() => choosePreset(preset)} disabled={running}>{preset} min</button>)}</div>
          <div className="timer-wrap">
            <svg className="timer-ring" viewBox="0 0 280 280" aria-hidden="true"><circle className="timer-ring-track" cx="140" cy="140" r="126" /><circle className="timer-ring-progress" cx="140" cy="140" r="126" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - remaining / duration)} /></svg>
            <div className="timer-readout"><span>{running ? 'IN FOCUS' : remaining === 0 ? 'SESSION COMPLETE' : 'READY TO BEGIN'}</span><strong aria-live="polite">{minutes}:{seconds}</strong><small>{running ? 'Stay with it.' : 'Take a breath. Start when ready.'}</small></div>
          </div>
          <div className="timer-controls">
            <button className="icon-button timer-reset" onClick={reset} aria-label="Reset timer"><RotateCcw size={20} /></button>
            <button className="timer-start" onClick={() => { if (remaining === 0) setRemaining(duration); setRunning((value) => !value); }}>{running ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}{running ? 'Pause session' : remaining === 0 ? 'Start again' : 'Start focusing'}</button>
            <button className="icon-button timer-reset" onClick={logElapsed} disabled={elapsed < 60} aria-label="Log elapsed focus time" title="Log elapsed full minutes"><Check size={21} /></button>
          </div>
        </section>
        <aside className="focus-side">
          <section className="panel focus-task-panel">
            <span className="eyebrow">WORKING ON</span>
            <label className="field"><span className="sr-only">Focus task</span><select value={activeTask?.id ?? ''} onChange={(event) => onSelectTask(event.target.value || undefined)}><option value="">Unassigned focus session</option>{openTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
            {activeTask ? <div className="selected-focus-task"><span className="project-dot" style={{ backgroundColor: project?.color }} /><div><strong>{project?.name}</strong><span>{activeTask.priority} priority • {activeTask.estimateMinutes}m estimate</span></div></div> : <p className="muted-copy">You can focus without a task, or choose one to connect this session to your work.</p>}
          </section>
          <section className="panel recent-focus-panel">
            <div className="panel-heading"><div><h2>Recent sessions</h2><span>Your focused work</span></div><Clock3 size={18} /></div>
            <div className="session-list">
              {recent.map((session) => {
                const task = state.tasks.find((item) => item.id === session.taskId);
                return <div className="session-row" key={session.id}><span className="session-check"><Check size={14} /></span><div><strong>{task?.title ?? 'Open focus session'}</strong><span>{shortTime(session.completedAt)}</span></div><b>{formatMinutes(session.minutes)}</b></div>;
              })}
              {!recent.length && <p className="muted-copy">Completed sessions will appear here.</p>}
            </div>
          </section>
          <p className="focus-tip">Tip: put your phone out of reach and close the tabs you do not need.</p>
        </aside>
      </div>
    </div>
  );
}
