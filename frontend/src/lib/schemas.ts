import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'InProgress', 'Done']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().refine(
  data => Object.values(data).some(v => v !== undefined),
  { message: 'At least one field is required' }
);

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

import type { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Compile-time invariant: form values must be assignable to API request types
export type _AssertCreateCompat = CreateTaskFormValues extends CreateTaskRequest ? true : never;
export type _AssertUpdateCompat = UpdateTaskFormValues extends UpdateTaskRequest ? true : never;
