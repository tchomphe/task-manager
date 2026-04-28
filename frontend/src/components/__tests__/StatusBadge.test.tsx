import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders Todo', () => {
    render(<StatusBadge status="Todo" />);
    const el = screen.getByText('Todo');
    expect(el.className).toContain('bg-slate-100');
    expect(el.className).toContain('text-slate-600');
  });
  it('renders In Progress for InProgress', () => {
    render(<StatusBadge status="InProgress" />);
    const el = screen.getByText('In Progress');
    expect(el.className).toContain('bg-blue-100');
    expect(el.className).toContain('text-blue-600');
  });
  it('renders Done', () => {
    render(<StatusBadge status="Done" />);
    const el = screen.getByText('Done');
    expect(el.className).toContain('bg-green-100');
    expect(el.className).toContain('text-green-600');
  });
});
