'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Award, Trash2, Edit2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function DesignationsPage() {
  const { data: desigRes, isLoading } = useSWR('/api/designations', fetcher);
  const designations = desigRes?.data || [];

  // Form State
  const [desigId, setDesigId] = useState(null);
  const [desigName, setDesigName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleReset = () => {
    setDesigId(null);
    setDesigName('');
    setStatusMessage(null);
  };

  const handleEdit = (d) => {
    setDesigId(d.id);
    setDesigName(d.designation || '');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desigName.trim()) {
      setStatusMessage({ type: 'error', text: 'Designation is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      designation: desigName.trim(),
      is_active: 'yes'
    };

    if (desigId) {
      payload.id = desigId;
    }

    try {
      const res = await fetch('/api/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: desigId ? 'Designation updated successfully!' : 'Designation added successfully!'
        });
        handleReset();
        mutate('/api/designations');
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
    if (!confirm('Are you sure you want to delete this designation?')) {
      return;
    }
    try {
      const res = await fetch(`/api/designations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/designations');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete designation');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <Award size={28} /> Designations
        </h2>
        <p className="text-zinc-400 text-sm">Define and manage staff designations (e.g. Principal, Senior Teacher, Librarian).</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">
              {desigId ? 'Edit Designation' : 'Add Designation'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Designation *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Accountant, Principal" 
                  value={desigName} 
                  onChange={(e) => setDesigName(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  {desigId ? 'Update Designation' : 'Save Designation'}
                </button>
                {(desigId || desigName) && (
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
              <h3 className="text-lg font-semibold text-white">Designation Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {designations.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading designations...</div>
            ) : designations.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Designation</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designations.map((d) => (
                      <tr key={d.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">{d.designation}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => handleEdit(d)} className="p-2 text-zinc-400 hover:text-emerald-400 border border-transparent hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(d.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No designations defined yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
