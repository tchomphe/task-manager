import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriorityBadge } from '../PriorityBadge';

describe('PriorityBadge', () => {
  it('renders Low with gray style', () => {
    render(<PriorityBadge priority="Low" />);
    const el = screen.getByText('Low');
    expect(el.className).toContain('bg-gray-100');
    expect(el.className).toContain('text-gray-600');
  });
  it('renders Medium with yellow style', () => {
    render(<PriorityBadge priority="Medium" />);
    const el = screen.getByText('Medium');
    expect(el.className).toContain('bg-yellow-100');
    expect(el.className).toContain('text-yellow-700');
  });
  it('renders High with red style', () => {
    render(<PriorityBadge priority="High" />);
    const el = screen.getByText('High');
    expect(el.className).toContain('bg-red-100');
    expect(el.className).toContain('text-red-600');
  });
});
