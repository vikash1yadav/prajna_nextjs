'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Settings, Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const TABS = [
  { id: 'purpose', label: 'Visitor Purpose', endpoint: '/api/visitor-purposes', fieldName: 'visitors_purpose', displayLabel: 'Purpose' },
  { id: 'complaint_type', label: 'Complaint Type', endpoint: '/api/complaint-types', fieldName: 'complaint_type', displayLabel: 'Complaint Type' },
  { id: 'source', label: 'Source', endpoint: '/api/sources', fieldName: 'source', displayLabel: 'Source' },
  { id: 'reference', label: 'Reference', endpoint: '/api/references', fieldName: 'reference', displayLabel: 'Reference' }
];

export default function FrontOfficeSetupPage() {
  const [activeTabId, setActiveTabId] = useState('purpose');
  const activeTab = TABS.find(t => t.id === activeTabId);

  const { data: response, error, isLoading } = useSWR(activeTab.endpoint, fetcher);
  const items = response?.data || [];

  // Form State
  const [nameVal, setNameVal] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Handle Edit Action
  const handleEditClick = (item) => {
    setEditId(item.id);
    setNameVal(item[activeTab.fieldName]);
    setDescription(item.description || '');
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setNameVal('');
    setDescription('');
    setStatusMessage(null);
  };

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
    setEditId(null);
    setNameVal('');
    setDescription('');
    setStatusMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameVal.trim()) {
      setStatusMessage({ type: 'error', text: `${activeTab.displayLabel} name is required` });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `${activeTab.endpoint}/${editId}` : activeTab.endpoint;
      const method = editId ? 'PUT' : 'POST';

      const payload = {
        [activeTab.fieldName]: nameVal.trim(),
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
          text: editId ? `${activeTab.displayLabel} updated successfully!` : `${activeTab.displayLabel} created successfully!`
        });
        setNameVal('');
        setDescription('');
        setEditId(null);
        mutate(activeTab.endpoint);
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
    if (!confirm(`Are you sure you want to delete this ${activeTab.displayLabel.toLowerCase()}?`)) {
      return;
    }

    try {
      const res = await fetch(`${activeTab.endpoint}/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate(activeTab.endpoint);
      } else {
        alert(data.message || `Failed to delete ${activeTab.displayLabel.toLowerCase()}`);
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
          <Settings size={28} /> Front Office Setup
        </h2>
        <p className="text-zinc-400 text-sm">Configure various setup parameters utilized throughout the Front Office desk.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTabId === tab.id
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? `Edit ${activeTab.displayLabel}` : `Create ${activeTab.displayLabel}`}
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
                  {activeTab.displayLabel} Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={`Enter ${activeTab.displayLabel.toLowerCase()}...`}
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
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
                {(nameVal || description || editId) && (
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
              <h3 className="text-lg font-semibold text-white">{activeTab.label} List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {items.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading parameters...
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
                      <th>{activeTab.displayLabel}</th>
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
                        <td className="font-medium text-white">{item[activeTab.fieldName]}</td>
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
                No setup items found. Create a new one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
