import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { createTaskSchema, type CreateTaskFormValues } from '../lib/schemas';
import { useTags, useCreateTag } from '../hooks/useTags';
import type { TaskResponse, TagResponse, CreateTaskRequest } from '../types';
import { Input } from './Input';
import { Button } from './Button';
import { TagChip } from './TagChip';

interface Props {
  task?: TaskResponse;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  onDelete?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function TaskForm({ task, onSubmit, onDelete, isSubmitting, submitError }: Props) {
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();

  const [selectedTags, setSelectedTags] = useState<TagResponse[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'Todo',
      priority: task?.priority ?? 'Medium',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    },
  });

  const filteredTags = allTags.filter(t =>
    t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.some(s => s.id === t.id)
  );

  const exactMatch = allTags.some(t => t.name.toLowerCase() === tagInput.trim().toLowerCase());
  const showCreateOption = tagInput.trim().length > 0 && !exactMatch;

  const handleTagSelect = (tag: TagResponse) => {
    setSelectedTags(prev => [...prev, tag]);
    setTagInput('');
    setShowDropdown(false);
  };

  const handleCreateTag = async () => {
    const name = tagInput.trim();
    try {
      const newTag = await createTag.mutateAsync({ name });
      setSelectedTags(prev => [...prev, newTag]);
      setTagInput('');
      setShowDropdown(false);
      setTagError(null);
    } catch {
      setTagError(`Failed to create tag "${name}". It may already exist.`);
    }
  };

  const handleFormSubmit = handleSubmit(async formData => {
    await onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00Z` : undefined,
      tags: selectedTags.map(t => t.name),
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <Input label="Title" {...register('title')} error={errors.title?.message} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select {...register('priority')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <Input label="Due Date" type="date" {...register('dueDate')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedTags.map(tag => (
              <TagChip key={tag.id} name={tag.name} color={tag.color} onRemove={() => setSelectedTags(prev => prev.filter(t => t.id !== tag.id))} />
            ))}
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={e => { setTagInput(e.target.value); setShowDropdown(true); setTagError(null); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Add tags..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {showDropdown && (filteredTags.length > 0 || showCreateOption) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
              {filteredTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onMouseDown={() => handleTagSelect(tag)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {tag.color && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />}
                  {tag.name}
                </button>
              ))}
              {showCreateOption && (
                <button
                  type="button"
                  onMouseDown={handleCreateTag}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-indigo-600 font-medium"
                >
                  Create &quot;{tagInput.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>
        {tagError && <p className="text-xs text-red-600 mt-1">{tagError}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex items-center justify-between pt-2">
        {onDelete ? (
          <button type="button" onClick={onDelete} className="text-sm text-red-600 hover:text-red-700">
            Delete task
          </button>
        ) : <div />}
        <Button type="submit" loading={isSubmitting}>
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}
