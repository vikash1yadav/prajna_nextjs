'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

export default function DivisionPage() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, name: '', percentage_from: '', percentage_to: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams/divisions');
      const json = await res.json();
      setDivisions(json.data || []);
    } catch (e) {
      showNotification('Failed to load divisions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/exams/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        showNotification(form.id ? 'Division updated successfully' : 'Division added successfully');
        setForm({ id: null, name: '', percentage_from: '', percentage_to: '', description: '' });
        loadDivisions();
      }
    } catch (err) {
      showNotification('Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this division classification?')) return;
    try {
      const res = await fetch(`/api/exams/divisions/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification('Division standard deleted');
        loadDivisions();
      }
    } catch (e) {
      showNotification('Delete failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Marks Division Ledger</h2>
        <p className="text-zinc-400 text-sm">Configure standard division classifications (e.g. Distinction, First Class) based on overall percentage ranges.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form: Add / Edit Division */}
        <div className="glass-card h-fit flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            {form.id ? 'Edit Division Class' : 'Add Division Class'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Division Name *</label>
              <input 
                type="text" 
                placeholder="e.g. First Division, Second Division"
                className="input-field w-full"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Percentage From *</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 60.00"
                  className="input-field w-full"
                  value={form.percentage_from}
                  onChange={e => setForm({ ...form, percentage_from: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Percentage Upto *</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 74.99"
                  className="input-field w-full"
                  value={form.percentage_to}
                  onChange={e => setForm({ ...form, percentage_to: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <input 
                type="text" 
                placeholder="e.g. Highly Satisfactory"
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
                Save Division
              </button>
              {form.id && (
                <button 
                  type="button" 
                  onClick={() => setForm({ id: null, name: '', percentage_from: '', percentage_to: '', description: '' })}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right List: Divisions */}
        <div className="glass-card xl:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white">Active Classification Matrix</h3>
          
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading divisions...</div>
          ) : divisions.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
              No divisions registered yet. Add one from the left panel.
            </div>
          ) : (
            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Division Name</th>
                    <th>Percentage Range</th>
                    <th>Description</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map(d => (
                    <tr key={d.id}>
                      <td className="font-semibold text-white">{d.name}</td>
                      <td>{parseFloat(d.percentage_from || 0).toFixed(2)}% - {parseFloat(d.percentage_to || 0).toFixed(2)}%</td>
                      <td>{d.description || 'N/A'}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setForm(d)}
                            className="p-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(d.id)}
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
