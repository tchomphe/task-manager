import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders Todo', () => {
    render(<StatusBadge status="Todo" />);
    expect(screen.getByText('Todo')).toBeDefined();
  });
  it('renders In Progress for InProgress', () => {
    render(<StatusBadge status="InProgress" />);
    expect(screen.getByText('In Progress')).toBeDefined();
  });
  it('renders Done', () => {
    render(<StatusBadge status="Done" />);
    expect(screen.getByText('Done')).toBeDefined();
  });
});
