import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriorityBadge } from '../PriorityBadge';

describe('PriorityBadge', () => {
  it('renders Low with gray style', () => {
    render(<PriorityBadge priority="Low" />);
    expect(screen.getByText('Low')).toBeDefined();
  });
  it('renders Medium with yellow style', () => {
    render(<PriorityBadge priority="Medium" />);
    expect(screen.getByText('Medium')).toBeDefined();
  });
  it('renders High with red style', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High')).toBeDefined();
  });
});
