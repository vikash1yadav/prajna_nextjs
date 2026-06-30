'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { CalendarRange, Trash2, Edit2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function LeaveTypesPage() {
  const { data: leaveTypeRes, isLoading } = useSWR('/api/leave-types', fetcher);
  const leaveTypes = leaveTypeRes?.data || [];

  // Form State
  const [typeId, setTypeId] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleReset = () => {
    setTypeId(null);
    setTypeName('');
    setStatusMessage(null);
  };

  const handleEdit = (t) => {
    setTypeId(t.id);
    setTypeName(t.type || '');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) {
      setStatusMessage({ type: 'error', text: 'Leave type name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      type: typeName.trim(),
      is_active: 'yes'
    };

    if (typeId) {
      payload.id = typeId;
    }

    try {
      const res = await fetch('/api/leave-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: typeId ? 'Leave type updated successfully!' : 'Leave type added successfully!'
        });
        handleReset();
        mutate('/api/leave-types');
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
    if (!confirm('Are you sure you want to delete this leave type?')) {
      return;
    }
    try {
      const res = await fetch(`/api/leave-types/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/leave-types');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete leave type');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <CalendarRange size={28} /> Leave Types
        </h2>
        <p className="text-zinc-400 text-sm">Define and manage institutional leave categories (e.g. Sick Leave, Casual Leave).</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">
              {typeId ? 'Edit Leave Type' : 'Add Leave Type'}
            </h3>

            {statusMessage && (
              <div className={`p-3 rounded-lg border text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Leave Type Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Sick Leave, Maternity Leave" 
                  value={typeName} 
                  onChange={(e) => setTypeName(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  {typeId ? 'Update Leave Type' : 'Save Leave Type'}
                </button>
                {(typeId || typeName) && (
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
          <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Leave Type Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {leaveTypes.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading leave types...</div>
            ) : leaveTypes.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Leave Type Name</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveTypes.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">{t.type}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => handleEdit(t)} className="p-2 text-zinc-400 hover:text-emerald-400 border border-transparent hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No leave types defined yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
