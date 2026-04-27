import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '../AuthContext';
import { useLogin, useRegister } from '../hooks/useAuth';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '../lib/schemas';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function LoginPage() {
  const { isAuthed } = useAuthContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (isAuthed) return <Navigate to="/tasks" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Task Manager</h1>
        <div role="tablist" className="flex border-b border-gray-200 mb-6">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create account
          </button>
        </div>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

function LoginForm() {
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const apiError = login.error
    ? (login.error as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Invalid credentials'
    : null;

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
      {apiError && <p className="text-sm text-red-600">{apiError}</p>}
      <Button type="submit" loading={login.isPending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}

function RegisterForm() {
  const register_ = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const apiError = register_.error
    ? (register_.error as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Registration failed'
    : null;

  return (
    <form onSubmit={handleSubmit((data) => register_.mutate(data))} className="space-y-4">
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
      <Input label="Confirm Password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      {apiError && <p className="text-sm text-red-600">{apiError}</p>}
      <Button type="submit" loading={register_.isPending} className="w-full">
        Create account
      </Button>
    </form>
  );
}
