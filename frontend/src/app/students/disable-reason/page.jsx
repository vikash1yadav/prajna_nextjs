'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { AlertOctagon, Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function DisableReasonPage() {
  const { data: response, error, isLoading } = useSWR('/api/disable-reasons', fetcher);
  const reasons = response?.data || [];

  // Form State
  const [reason, setReason] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Handle Edit Action
  const handleEditClick = (item) => {
    setEditId(item.id);
    setReason(item.reason);
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setReason('');
    setStatusMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setStatusMessage({ type: 'error', text: 'Disable reason is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `/api/disable-reasons/${editId}` : '/api/disable-reasons';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'Reason updated successfully!' : 'Reason created successfully!'
        });
        setReason('');
        setEditId(null);
        mutate('/api/disable-reasons');
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
    if (!confirm('Are you sure you want to delete this reason?')) {
      return;
    }

    try {
      const res = await fetch(`/api/disable-reasons/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate('/api/disable-reasons');
      } else {
        alert(data.message || 'Failed to delete reason');
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
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-rose-500 flex items-center gap-2">
          <AlertOctagon size={28} /> Disable Reasons
        </h2>
        <p className="text-zinc-400 text-sm">Manage predefined reasons for marking students as disabled/inactive in the school database.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-rose-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Reason' : 'Create Reason'}
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
                  Disable Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter reason (e.g. Health Issues)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                >
                  {editId ? 'Update' : 'Save'}
                </button>
                {(reason || editId) && (
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

        {/* Right Side: Reason List */}
        <div className="col-span-1 md:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-rose-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Disable Reason List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {reasons.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading disable reasons...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                Failed to load disable reasons list.
              </div>
            ) : reasons.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Disable Reason</th>
                      <th>Reason ID</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reasons.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/5 transition-colors ${
                          editId === item.id ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        <td className="font-medium text-white">{item.reason}</td>
                        <td className="font-mono text-zinc-400 text-sm">{item.id}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`p-2 rounded-lg transition-colors border ${
                              editId === item.id
                                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'
                            }`}
                            title="Edit Reason"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Reason"
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
                No disable reasons found. Create a new one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
