import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { CheckSquare2, Command, Download, FolderKanban, LayoutDashboard, NotebookPen, Search, TimerReset, Upload } from 'lucide-react';
import { CommandPalette, type CommandAction } from './components/CommandPalette';
import { NoteModal } from './components/NoteModal';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { exportWorkspace, importWorkspace, loadWorkspace, saveWorkspace, workspaceReducer } from './lib/store';
import { fullDate } from './lib/dates';
import type { Note, NoteDraft, ProjectDraft, TaskDraft, TaskStatus, View } from './lib/types';
import { FocusView } from './views/FocusView';
import { NotesView } from './views/NotesView';
import { ProjectsView } from './views/ProjectsView';
import { TasksView } from './views/TasksView';
import { TodayView } from './views/TodayView';

const navigation: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'focus', label: 'Focus', icon: TimerReset },
];

type ModalName = 'task' | 'note' | 'project' | null;

export default function App() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, () => loadWorkspace(window.localStorage));
  const [view, setView] = useState<View>('today');
  const [modal, setModal] = useState<ModalName>(null);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [commandOpen, setCommandOpen] = useState(false);
  const [toast, setToast] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveWorkspace(state, window.localStorage), [state]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = useCallback((next: View) => setView(next), []);
  const toggleTask = useCallback((id: string) => dispatch({ type: 'task/toggle', id }), []);
  const statusTask = useCallback((id: string, status: TaskStatus) => dispatch({ type: 'task/status', id, status }), []);
  const deleteTask = useCallback((id: string) => dispatch({ type: 'task/delete', id }), []);
  const activateTask = useCallback((id: string) => {
    dispatch({ type: 'task/activate', id });
    setToast('Current focus updated');
  }, []);
  const logSession = useCallback((minutes: number, taskId?: string) => {
    dispatch({ type: 'focus/log', minutes, taskId });
    setToast(`${minutes} focus minutes logged`);
  }, []);

  function saveTask(draft: TaskDraft) {
    dispatch({ type: 'task/add', draft });
    setModal(null);
    setToast('Task added to your workspace');
  }

  function saveNote(draft: NoteDraft) {
    if (editingNote) dispatch({ type: 'note/update', id: editingNote.id, draft });
    else dispatch({ type: 'note/add', draft });
    setEditingNote(undefined);
    setModal(null);
    setToast(editingNote ? 'Note updated' : 'Note saved');
  }

  function saveProject(draft: ProjectDraft) {
    dispatch({ type: 'project/add', draft });
    setModal(null);
    setToast('Project created');
  }

  function runCommand(action: CommandAction) {
    setCommandOpen(false);
    if (action === 'new-task') setModal('task');
    else if (action === 'new-note') { setEditingNote(undefined); setModal('note'); }
    else if (action === 'new-project') setModal('project');
    else if (action === 'start-focus') setView('focus');
    else setView(action.replace('view-', '') as View);
  }

  function downloadBackup() {
    const blob = new Blob([exportWorkspace(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pilotdesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('Workspace backup downloaded');
  }

  async function readBackup(file?: File) {
    if (!file) return;
    try {
      const imported = importWorkspace(await file.text());
      dispatch({ type: 'workspace/replace', state: imported });
      setToast('Workspace restored from backup');
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not read this backup');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  }

  const sharedTaskProps = { onToggle: toggleTask, onStatus: statusTask, onDelete: deleteTask, onActivate: activateTask };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView('today')} aria-label="PilotDesk home"><span className="brand-mark"><i /><i /><i /></span><span>PILOT<strong>DESK</strong></span></button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const count = item.id === 'tasks' ? state.tasks.filter((task) => task.status !== 'done').length : item.id === 'notes' ? state.notes.length : undefined;
            return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)} aria-current={view === item.id ? 'page' : undefined}><Icon size={19} /><span>{item.label}</span>{count !== undefined && <b>{count}</b>}</button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-status"><span><i />LOCAL WORKSPACE</span><p>Your data stays on this device.</p></div>
          <div className="data-actions"><button onClick={downloadBackup} title="Download workspace backup"><Download size={16} /><span>Export</span></button><button onClick={() => importRef.current?.click()} title="Restore workspace backup"><Upload size={16} /><span>Import</span></button></div>
          <input ref={importRef} className="sr-only" type="file" accept="application/json,.json" aria-label="Import workspace backup" onChange={(event) => readBackup(event.target.files?.[0])} />
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><i /><i /><i /></span>PILOT<strong>DESK</strong></div>
          <button className="search-trigger" onClick={() => setCommandOpen(true)}><Search size={17} /><span>Search or jump to...</span><kbd><Command size={11} /> K</kbd></button>
          <div className="topbar-right"><span>{fullDate()}</span><div className="avatar" title="Local profile">AV</div></div>
        </header>
        <main>
          {view === 'today' && <TodayView state={state} onNavigate={navigate} onNewTask={() => setModal('task')} {...sharedTaskProps} onQuickNote={(draft) => { dispatch({ type: 'note/add', draft }); setToast('Quick note saved'); }} />}
          {view === 'tasks' && <TasksView state={state} onNewTask={() => setModal('task')} {...sharedTaskProps} />}
          {view === 'projects' && <ProjectsView state={state} onNewProject={() => setModal('project')} onNavigate={navigate} />}
          {view === 'notes' && <NotesView state={state} onNewNote={() => { setEditingNote(undefined); setModal('note'); }} onEditNote={(note) => { setEditingNote(note); setModal('note'); }} onDeleteNote={(id) => dispatch({ type: 'note/delete', id })} onPinNote={(id) => dispatch({ type: 'note/pin', id })} />}
          {view === 'focus' && <FocusView state={state} onSelectTask={(id) => dispatch({ type: 'task/activate', id })} onLogSession={logSession} />}
        </main>
      </div>

      {modal === 'task' && <TaskModal projects={state.projects} onClose={() => setModal(null)} onSave={saveTask} />}
      {modal === 'note' && <NoteModal note={editingNote} onClose={() => { setModal(null); setEditingNote(undefined); }} onSave={saveNote} />}
      {modal === 'project' && <ProjectModal onClose={() => setModal(null)} onSave={saveProject} />}
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} onAction={runCommand} />}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
