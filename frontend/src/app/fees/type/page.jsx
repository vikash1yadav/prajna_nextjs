'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Layers, Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function FeesTypePage() {
  const { data: response, error, isLoading } = useSWR('/api/fees/types', fetcher);
  const items = response?.data || [];

  // Form State
  const [type, setType] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Handle Edit Action
  const handleEditClick = (item) => {
    setEditId(item.id);
    setType(item.type);
    setCode(item.code);
    setDescription(item.description || '');
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setType('');
    setCode('');
    setDescription('');
    setStatusMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type.trim()) {
      setStatusMessage({ type: 'error', text: 'Fees type name is required' });
      return;
    }
    if (!code.trim()) {
      setStatusMessage({ type: 'error', text: 'Fees type code is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `/api/fees/types/${editId}` : '/api/fees/types';
      const method = editId ? 'PUT' : 'POST';

      const payload = {
        type: type.trim(),
        code: code.trim(),
        description: description.trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'Fees type updated successfully!' : 'Fees type created successfully!'
        });
        setType('');
        setCode('');
        setDescription('');
        setEditId(null);
        mutate('/api/fees/types');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'An error occurred' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Action
  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this fees type?')) {
      return;
    }

    try {
      const res = await fetch(`/api/fees/types/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate('/api/fees/types');
      } else {
        alert(data.message || 'Failed to delete fees type');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <Layers size={28} /> Fees Type
        </h2>
        <p className="text-zinc-400 text-sm">Define specific types of fees, codes, and attributes for detailed fee components.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Fees Type' : 'Create Fees Type'}
            </h3>

            {statusMessage && (
              <div
                className={`p-3 rounded-lg border text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Type Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter fee type (e.g. Admission Fee)..."
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter code (e.g. ADM-01)..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none py-2"
                  placeholder="Enter description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                >
                  {editId ? 'Update' : 'Save'}
                </button>
                {(type || code || description || editId) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    title="Reset Form"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: List */}
        <div className="col-span-1 md:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Fees Type List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {items.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading fees types...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                Failed to load list.
              </div>
            ) : items.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>ID</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/5 transition-colors ${
                          editId === item.id ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <td className="font-medium text-white">{item.type}</td>
                        <td className="font-mono text-zinc-300 text-sm">{item.code}</td>
                        <td className="text-zinc-300 text-sm max-w-[300px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="font-mono text-zinc-400 text-sm">{item.id}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`p-2 rounded-lg transition-colors border ${
                              editId === item.id
                                ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'
                            }`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No fees types found. Create a new one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
