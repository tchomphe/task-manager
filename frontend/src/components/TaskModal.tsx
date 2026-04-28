import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTask, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import type { CreateTaskRequest } from '../types';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from './ConfirmDialog';

export function TaskModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskParam = searchParams.get('task');
  const isOpen = taskParam !== null;
  const isCreate = taskParam === 'new';
  const editId = isCreate ? undefined : (taskParam ?? undefined);

  const { data: task, isLoading, isError: taskFetchError } = useTask(editId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const close = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('task');
      return next;
    }, { replace: true });
    setSubmitError(null);
    setShowConfirm(false);
  }, [setSearchParams]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const handleSubmit = async (data: CreateTaskRequest) => {
    try {
      setSubmitError(null);
      if (isCreate) await createTask.mutateAsync(data);
      else if (editId) await updateTask.mutateAsync({ id: editId, data });
      close();
    } catch {
      setSubmitError('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    try {
      await deleteTask.mutateAsync(editId);
      close();
    } catch {
      setSubmitError('Failed to delete task.');
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div data-testid="modal-backdrop" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={close}>
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              {isCreate ? 'New Task' : 'Edit Task'}
            </h2>
            <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">✕</button>
          </div>
          <div className="px-6 py-4">
            {!isCreate && taskFetchError ? (
              <div className="py-8 text-center text-sm text-red-600">
                Failed to load task. Please close and try again.
              </div>
            ) : !isCreate && isLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
            ) : (
              <TaskForm
                task={isCreate ? undefined : task}
                onSubmit={handleSubmit}
                onDelete={isCreate ? undefined : () => setShowConfirm(true)}
                isSubmitting={createTask.isPending || updateTask.isPending}
                submitError={submitError}
              />
            )}
          </div>
        </div>
      </div>
      {showConfirm && (
        <ConfirmDialog
          message="Delete this task? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
