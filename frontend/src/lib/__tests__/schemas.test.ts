import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '../schemas';

describe('createTaskSchema', () => {
  it('requires title', () => {
    const result = createTaskSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required');
    }
  });

  it('rejects title over 200 chars', () => {
    const result = createTaskSchema.safeParse({ title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('accepts valid task', () => {
    const result = createTaskSchema.safeParse({
      title: 'My task',
      status: 'Todo',
      priority: 'Medium',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateTaskSchema', () => {
  it('rejects empty object', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least one field is required');
    }
  });

  it('rejects object with all undefined values', () => {
    const result = updateTaskSchema.safeParse({ title: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('At least one field is required');
    }
  });

  it('accepts partial update', () => {
    const result = updateTaskSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });
});
