import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders the message', () => {
    render(<ConfirmDialog message="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Are you sure?')).toBeDefined();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Escape key is pressed', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);
    const backdrop = screen.getByTestId('dialog-backdrop');
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not call onCancel when dialog content is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog message="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Delete?'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
