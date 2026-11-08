import { ArrowRight, FolderKanban, Plus } from 'lucide-react';
import { projectProgress } from '../lib/selectors';
import type { View, WorkspaceState } from '../lib/types';

export function ProjectsView({ state, onNewProject, onNavigate }: { state: WorkspaceState; onNewProject: () => void; onNavigate: (view: View) => void }) {
  const projects = projectProgress(state.projects, state.tasks);
  return (
    <div className="view projects-view">
      <div className="view-title-row">
        <div><span className="eyebrow">YOUR PROJECTS</span><h1>Give good work a home.</h1><p>Keep every goal in view and every next step within reach.</p></div>
        <button className="button primary" onClick={onNewProject}><Plus size={17} />New project</button>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.id} style={{ '--project-color': project.color } as React.CSSProperties}>
            <div className="project-card-top"><span className="project-icon"><FolderKanban size={22} /></span><span className="project-number">0{index + 1}</span></div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="project-progress-label"><span>{project.completed} of {project.total} tasks complete</span><strong>{project.progress}%</strong></div>
            <div className="progress-track"><div style={{ width: `${project.progress}%` }} /></div>
            <div className="next-step"><span>NEXT STEP</span><p>{project.nextTask?.title ?? 'Nothing pending. Choose your next move.'}</p></div>
            <button className="project-link" onClick={onNavigate.bind(null, 'tasks')}>Open task list <ArrowRight size={15} /></button>
          </article>
        ))}
        <button className="new-project-card" onClick={onNewProject}><span><Plus size={24} /></span><h2>Make space for something new</h2><p>Start a project and break it into clear next steps.</p></button>
      </div>
    </div>
  );
}
