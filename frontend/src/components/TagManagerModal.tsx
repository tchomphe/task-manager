import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../hooks/useTags';
import type { TagResponse } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { ErrorMessage } from './ErrorMessage';
import { Button } from './Button';

interface Props { onClose: () => void }

export function TagManagerModal({ onClose }: Props) {
  const { data: tags = [], isLoading, isError, refetch } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await createTag.mutateAsync({ name, color: newColor });
      setNewName('');
      setCreateError(null);
    } catch {
      setCreateError('Failed to create tag. It may already exist.');
    }
  };

  const startEdit = (tag: TagResponse) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color ?? '#6366f1');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await updateTag.mutateAsync({ id: editingId, data: { name: editName.trim() || undefined, color: editColor || undefined } });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTag.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Manage Tags</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
          <div className="px-6 py-4">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
              </div>
            )}
            {isError && <ErrorMessage onRetry={() => refetch()} />}
            {!isLoading && !isError && (
              <>
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No tags yet. Create your first tag below.</p>
                )}
                <div className="space-y-1 mb-4">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      {editingId === tag.id ? (
                        <>
                          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5" />
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          <button onClick={handleUpdate} className="text-xs text-indigo-600 hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color ?? '#e5e7eb' }} />
                          <span className="flex-1 text-sm text-gray-900">{tag.name}</span>
                          <button onClick={() => startEdit(tag)} className="text-gray-400 hover:text-gray-600" aria-label={`Edit ${tag.name}`}>&#9998;</button>
                          <button onClick={() => setDeleteId(tag.id)} className="text-red-400 hover:text-red-600" aria-label={`Delete ${tag.name}`}>✕</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">New tag</p>
                  <div className="flex gap-2">
                    <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0" />
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
                      placeholder="Tag name"
                      className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button onClick={handleCreate} loading={createTag.isPending} className="flex-shrink-0">
                      Add
                    </Button>
                  </div>
                  {createError && <p className="text-xs text-red-600 mt-1">{createError}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {deleteId && (
        <ConfirmDialog
          message="Delete this tag? It will be removed from all tasks."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
