import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuthContext();
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />;
}
