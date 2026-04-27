import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../../AuthContext';
import { LoginPage } from '../../pages/LoginPage';
import axiosClient from '../../lib/axiosClient';

vi.mock('../../lib/axiosClient');

function renderLoginPage(initialEntry = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tasks" element={<div>Tasks page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('toggles to register form when Create account is clicked', async () => {
    renderLoginPage();
    // Tab buttons have role="tab"; form submit has role="button" — no ambiguity
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();

    await userEvent.click(screen.getByRole('tab', { name: /create account/i }));

    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
  });

  it('shows Zod field errors on empty login submit', async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i, hidden: false }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeDefined();
    });
  });

  it('navigates to /tasks on successful login', async () => {
    vi.mocked(axiosClient.post).mockResolvedValueOnce({
      data: { token: 'test-token', expiresAt: new Date().toISOString() },
    });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i, hidden: false }));

    await waitFor(() => {
      expect(screen.getByText('Tasks page')).toBeDefined();
    });
  });

  it('shows API error message on failed login', async () => {
    vi.mocked(axiosClient.post).mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i, hidden: false }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeDefined();
    });
  });
});
