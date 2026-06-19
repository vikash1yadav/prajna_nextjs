'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { TrendingDown, Trash2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ExpenseHeadPage() {
  const { data: headsRes, isLoading } = useSWR('/api/expenses/heads', fetcher);
  const heads = headsRes?.data || [];

  // Form State
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleReset = () => {
    setCategory('');
    setDescription('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.trim()) {
      setStatusMessage({ type: 'error', text: 'Category name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      exp_category: category.trim(),
      description: description.trim() || null
    };

    try {
      const res = await fetch('/api/expenses/heads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Expense Head added successfully!'
        });
        handleReset();
        mutate('/api/expenses/heads');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category head? Any expense items under it may be unlinked.')) {
      return;
    }
    try {
      const res = await fetch(`/api/expenses/heads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/expenses/heads');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete category head');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-purple-400 flex items-center gap-2">
          <TrendingDown size={28} /> Expense Heads
        </h2>
        <p className="text-zinc-400 text-sm">Define and organize categories of miscellaneous expenses, like Utilities, Salary, Taxes, repairs or supplies.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-purple-500/10">
            <h3 className="text-lg font-semibold text-white">Add Expense Head</h3>

            {statusMessage && (
              <div className={`p-3 rounded-lg border text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category Name *</label>
                <input type="text" className="input-field" placeholder="Utilities, Staff Salaries, repairs..." value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea className="input-field min-h-[100px] resize-none py-1.5" placeholder="Enter category details..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-purple-600 hover:bg-purple-500 shadow-purple-600/20">
                  Save Category
                </button>
                {(category || description) && (
                  <button type="button" onClick={handleReset} className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5" title="Reset Form">
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Data Grid Panel */}
        <div className="col-span-1 lg:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-purple-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Categories Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {heads.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading categories...</div>
            ) : heads.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th>Description</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heads.map((h) => (
                      <tr key={h.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">{h.exp_category}</td>
                        <td className="text-zinc-400 text-sm whitespace-pre-line">{h.description || '-'}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => handleDelete(h.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No expense categories defined yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
