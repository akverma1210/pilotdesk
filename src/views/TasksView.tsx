import { useState } from 'react';
import { ListFilter, Plus, Search } from 'lucide-react';
import { TaskRow } from '../components/TaskRow';
import { filterTasks } from '../lib/selectors';
import type { TaskFilter, TaskStatus, WorkspaceState } from '../lib/types';

interface TasksViewProps {
  state: WorkspaceState;
  onNewTask: () => void;
  onToggle: (id: string) => void;
  onStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}

const filters: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'today', label: 'Due today' },
  { id: 'upcoming', label: 'Next 7 days' },
  { id: 'completed', label: 'Completed' },
];

export function TasksView({ state, onNewTask, onToggle, onStatus, onDelete, onActivate }: TasksViewProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [query, setQuery] = useState('');
  const tasks = filterTasks(state.tasks, filter, query);
  return (
    <div className="view tasks-view">
      <div className="view-title-row">
        <div><span className="eyebrow">YOUR TASK LIST</span><h1>Turn plans into progress.</h1><p>Prioritize the work that matters and let the rest wait.</p></div>
        <button className="button primary" onClick={onNewTask}><Plus size={17} />New task</button>
      </div>
      <section className="panel tasks-panel">
        <div className="task-toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Task filters">
            {filters.map((item) => <button key={item.id} role="tab" aria-selected={filter === item.id} className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)}>{item.label}<span>{filterTasks(state.tasks, item.id).length}</span></button>)}
          </div>
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label>
        </div>
        <div className="task-list-header"><span>TASK</span><span>DETAILS</span><span>STATUS</span></div>
        <div className="task-list full-task-list">
          {tasks.map((task) => <TaskRow key={task.id} task={task} projects={state.projects} onToggle={onToggle} onStatus={onStatus} onDelete={onDelete} onActivate={onActivate} />)}
          {!tasks.length && <div className="empty-state"><ListFilter size={30} /><h3>No tasks here</h3><p>{query ? 'Try another search or clear your filters.' : 'Add a task to get this list moving.'}</p>{!query && <button className="button secondary" onClick={onNewTask}>Add a task</button>}</div>}
        </div>
      </section>
    </div>
  );
}
