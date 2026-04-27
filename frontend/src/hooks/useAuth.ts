import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../lib/axiosClient';
import { useAuthContext } from '../AuthContext';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export function useLogin() {
  const { setToken } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      axiosClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.token);
      navigate('/tasks');
    },
  });
}

export function useRegister() {
  const { setToken } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      axiosClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.token);
      navigate('/tasks');
    },
  });
}
