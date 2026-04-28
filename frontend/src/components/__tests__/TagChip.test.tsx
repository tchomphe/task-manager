import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TagChip } from '../TagChip';

describe('TagChip', () => {
  it('renders tag name', () => {
    render(<TagChip name="work" color="#6366f1" />);
    expect(screen.getByText('work')).toBeDefined();
  });
  it('renders with gray fallback when color is null', () => {
    render(<TagChip name="work" color={null} />);
    const el = screen.getByText('work');
    expect(el.className).toContain('bg-gray-100');
    expect(el.className).toContain('text-gray-600');
  });
  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<TagChip name="work" color={null} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
  it('does not render remove button when onRemove not provided', () => {
    render(<TagChip name="work" color={null} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
