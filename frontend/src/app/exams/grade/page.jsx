'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

export default function GradePage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, name: '', point: '', mark_from: '', mark_upto: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams/grades');
      const json = await res.json();
      setGrades(json.data || []);
    } catch (e) {
      showNotification('Failed to load grades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/exams/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        showNotification(form.id ? 'Grade updated successfully' : 'Grade added successfully');
        setForm({ id: null, name: '', point: '', mark_from: '', mark_upto: '', description: '' });
        loadGrades();
      }
    } catch (err) {
      showNotification('Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;
    try {
      const res = await fetch(`/api/exams/grades/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification('Grade deleted');
        loadGrades();
      }
    } catch (e) {
      showNotification('Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Marks Grading Ledger</h2>
        <p className="text-zinc-400 text-sm">Configure GPA grade letters, passing thresholds, minimum/maximum mark intervals, and description labels.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form: Add / Edit Grade */}
        <div className="glass-card h-fit flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            {form.id ? 'Edit Grade Standard' : 'Add Grade Standard'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Grade Name *</label>
              <input 
                type="text" 
                placeholder="e.g. A+, A, B"
                className="input-field w-full"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Grade Point</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="e.g. 4.00"
                className="input-field w-full"
                value={form.point}
                onChange={e => setForm({ ...form, point: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Mark From *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 80"
                  className="input-field w-full"
                  value={form.mark_from}
                  onChange={e => setForm({ ...form, mark_from: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Mark Upto *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 89"
                  className="input-field w-full"
                  value={form.mark_upto}
                  onChange={e => setForm({ ...form, mark_upto: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <input 
                type="text" 
                placeholder="e.g. Excellent / Pass"
                className="input-field w-full"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="flex-grow btn-primary flex items-center justify-center gap-2 font-medium"
              >
                <Save size={16} />
                Save Grade
              </button>
              {form.id && (
                <button 
                  type="button" 
                  onClick={() => setForm({ id: null, name: '', point: '', mark_from: '', mark_upto: '', description: '' })}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right List: Grades */}
        <div className="glass-card xl:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white">Active Grading Matrix</h3>
          
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading grades...</div>
          ) : grades.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
              No grades registered yet. Add one from the left panel.
            </div>
          ) : (
            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Grade Name</th>
                    <th>Grade Point</th>
                    <th>Mark Range</th>
                    <th>Description</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => (
                    <tr key={g.id}>
                      <td className="font-semibold text-white">{g.name}</td>
                      <td>{parseFloat(g.point || 0).toFixed(2)}</td>
                      <td>{g.mark_from} % - {g.mark_upto} %</td>
                      <td>{g.description || 'N/A'}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setForm(g)}
                            className="p-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(g.id)}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
