'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Home, Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function StudentHousePage() {
  const { data: response, error, isLoading } = useSWR('/api/school-houses', fetcher);
  const houses = response?.data || [];

  // Form State
  const [houseName, setHouseName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Handle Edit Action
  const handleEditClick = (house) => {
    setEditId(house.id);
    setHouseName(house.house_name);
    setDescription(house.description || '');
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setHouseName('');
    setDescription('');
    setStatusMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!houseName.trim()) {
      setStatusMessage({ type: 'error', text: 'House name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `/api/school-houses/${editId}` : '/api/school-houses';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          house_name: houseName.trim(),
          description: description.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'House updated successfully!' : 'House created successfully!'
        });
        setHouseName('');
        setDescription('');
        setEditId(null);
        mutate('/api/school-houses');
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
    if (!confirm('Are you sure you want to delete this house?')) {
      return;
    }

    try {
      const res = await fetch(`/api/school-houses/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate('/api/school-houses');
      } else {
        alert(data.message || 'Failed to delete house');
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
          <Home size={28} /> Student Houses
        </h2>
        <p className="text-zinc-400 text-sm">Configure school houses for grouping students during sports, arts, or extra-curricular competitions.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit House' : 'Create House'}
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
                  House Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter house name (e.g. Red House)"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none py-2"
                  placeholder="Enter house description..."
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
                {(houseName || description || editId) && (
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

        {/* Right Side: House List */}
        <div className="col-span-1 md:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">House List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {houses.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading school houses...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                Failed to load school houses list.
              </div>
            ) : houses.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>House Name</th>
                      <th>Description</th>
                      <th>House ID</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {houses.map((house) => (
                      <tr
                        key={house.id}
                        className={`hover:bg-white/5 transition-colors ${
                          editId === house.id ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <td className="font-medium text-white">{house.house_name}</td>
                        <td className="text-zinc-300 text-sm max-w-[300px] truncate" title={house.description}>
                          {house.description || '-'}
                        </td>
                        <td className="font-mono text-zinc-400 text-sm">{house.id}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button
                            onClick={() => handleEditClick(house)}
                            className={`p-2 rounded-lg transition-colors border ${
                              editId === house.id
                                ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'
                            }`}
                            title="Edit House"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(house.id)}
                            className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete House"
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
                No school houses found. Create a new one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
