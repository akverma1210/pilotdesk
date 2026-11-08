import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('PilotDesk workflows', () => {
  beforeEach(() => window.localStorage.clear());

  it('adds a task through the task dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    await user.type(screen.getByLabelText('What needs to get done?'), 'Prepare the launch checklist');
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByText('Prepare the launch checklist')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Task added');
  });

  it('completes a task from Today', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Complete Write the portfolio case study outline' }));
    await user.click(screen.getByRole('button', { name: /^Tasks/ }));
    await user.click(screen.getByRole('tab', { name: /Completed/ }));
    expect(screen.getByRole('button', { name: 'Reopen Write the portfolio case study outline' })).toBeInTheDocument();
  });

  it('opens the command palette with a keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Go to Notes/ }));
    expect(screen.getByRole('heading', { name: 'Keep the thoughts worth keeping.' })).toBeInTheDocument();
  });

  it('creates a project', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Projects' }));
    await user.click(screen.getAllByRole('button', { name: /new project/i })[0]);
    await user.type(screen.getByLabelText('Project name'), 'Open source launch');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(screen.getByRole('heading', { name: 'Open source launch' })).toBeInTheDocument();
  });
});
