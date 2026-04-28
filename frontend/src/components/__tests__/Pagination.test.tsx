import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Pagination } from '../Pagination';

function renderPagination(page: number, totalPages: number, initialEntry = '/tasks') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/tasks" element={<Pagination page={page} totalPages={totalPages} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Pagination', () => {
  it('renders page info', () => {
    renderPagination(2, 5);
    expect(screen.getByText('Page 2 of 5')).toBeDefined();
  });

  it('disables Prev on first page', () => {
    renderPagination(1, 3);
    expect(screen.getByRole('button', { name: /prev/i })).toHaveProperty('disabled', true);
  });

  it('disables Next on last page', () => {
    renderPagination(3, 3);
    expect(screen.getByRole('button', { name: /next/i })).toHaveProperty('disabled', true);
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = renderPagination(1, 1);
    expect(container.firstChild).toBeNull();
  });
});
