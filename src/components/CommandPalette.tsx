import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckSquare2, FolderKanban, LayoutDashboard, NotebookPen, Plus, Search, TimerReset } from 'lucide-react';
import type { View } from '../lib/types';

export type CommandAction = 'new-task' | 'new-note' | 'new-project' | 'start-focus' | `view-${View}`;

const commands: { id: CommandAction; label: string; hint: string; icon: typeof Plus }[] = [
  { id: 'new-task', label: 'Add a new task', hint: 'Action', icon: Plus },
  { id: 'new-note', label: 'Capture a note', hint: 'Action', icon: NotebookPen },
  { id: 'new-project', label: 'Start a project', hint: 'Action', icon: FolderKanban },
  { id: 'start-focus', label: 'Start a focus session', hint: 'Action', icon: TimerReset },
  { id: 'view-today', label: 'Go to Today', hint: 'Navigate', icon: LayoutDashboard },
  { id: 'view-tasks', label: 'Go to Tasks', hint: 'Navigate', icon: CheckSquare2 },
  { id: 'view-projects', label: 'Go to Projects', hint: 'Navigate', icon: FolderKanban },
  { id: 'view-notes', label: 'Go to Notes', hint: 'Navigate', icon: NotebookPen },
  { id: 'view-focus', label: 'Go to Focus', hint: 'Navigate', icon: TimerReset },
];

export function CommandPalette({ onClose, onAction }: { onClose: () => void; onAction: (action: CommandAction) => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(() => commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="modal-backdrop command-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-input"><Search size={20} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a command or search..." aria-label="Search commands" /><kbd>esc</kbd></div>
        <div className="command-results">
          {filtered.length ? filtered.map((command) => {
            const Icon = command.icon;
            return <button key={command.id} onClick={() => onAction(command.id)}><Icon size={18} /><span>{command.label}</span><small>{command.hint}</small><ArrowRight size={15} /></button>;
          }) : <p className="empty-search">No commands match "{query}"</p>}
        </div>
      </section>
    </div>
  );
}
