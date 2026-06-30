'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Book, Trash2, Edit2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function SubjectsPage() {
  const { data: subjectsRes, isLoading } = useSWR('/api/subjects', fetcher);
  const subjects = subjectsRes?.data || [];

  // Form State
  const [subjectId, setSubjectId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('theory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleReset = () => {
    setSubjectId(null);
    setName('');
    setCode('');
    setType('theory');
    setStatusMessage(null);
  };

  const handleEdit = (subject) => {
    setSubjectId(subject.id);
    setName(subject.name || '');
    setCode(subject.code || '');
    setType(subject.type || 'theory');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Subject name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim(),
      code: code.trim() || null,
      type: type
    };

    if (subjectId) {
      payload.id = subjectId;
    }

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: subjectId ? 'Subject updated successfully!' : 'Subject added successfully!'
        });
        handleReset();
        mutate('/api/subjects');
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
    if (!confirm('Are you sure you want to delete this subject? This might affect existing class timetables and subject mappings.')) {
      return;
    }
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/subjects');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <Book size={28} /> Subjects
        </h2>
        <p className="text-zinc-400 text-sm">Create and manage your school curriculum subjects, designating them as Theory or Practical.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">
              {subjectId ? 'Edit Subject' : 'Add Subject'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Mathematics, Chemistry" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject Code</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. MATH101" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject Type *</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="theory" 
                      checked={type === 'theory'} 
                      onChange={() => setType('theory')} 
                      className="accent-emerald-500" 
                      disabled={isSubmitting}
                    />
                    Theory
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type" 
                      value="practical" 
                      checked={type === 'practical'} 
                      onChange={() => setType('practical')} 
                      className="accent-emerald-500" 
                      disabled={isSubmitting}
                    />
                    Practical
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  {subjectId ? 'Update Subject' : 'Save Subject'}
                </button>
                {(subjectId || name || code || type !== 'theory') && (
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
              <h3 className="text-lg font-semibold text-white">Subject Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {subjects.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading subjects...</div>
            ) : subjects.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Subject Code</th>
                      <th>Subject Type</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">{s.name}</td>
                        <td className="text-zinc-400 text-sm">{s.code || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                            s.type === 'theory' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => handleEdit(s)} className="p-2 text-zinc-400 hover:text-emerald-400 border border-transparent hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No subjects defined yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
