'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Send, Plus, Edit2, Trash2, RotateCcw, Eye, X } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function PostalDispatchPage() {
  const { data: dispatchRes, isLoading } = useSWR('/api/dispatch-receives?type=dispatch', fetcher);
  const items = dispatchRes?.data || [];

  // Form State
  const [refNo, setRefNo] = useState('');
  const [toTitle, setToTitle] = useState('');
  const [address, setAddress] = useState('');
  const [fromTitle, setFromTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditClick = (item) => {
    setEditId(item.id);
    setRefNo(item.reference_no || '');
    setToTitle(item.to_title || '');
    setAddress(item.address || '');
    setFromTitle(item.from_title || '');
    setDate(item.date || new Date().toISOString().slice(0, 10));
    setNote(item.note || '');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setRefNo('');
    setToTitle('');
    setAddress('');
    setFromTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Recipient title is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      reference_no: refNo.trim() || null,
      to_title: toTitle.trim(),
      address: address.trim() || null,
      from_title: fromTitle.trim() || null,
      date: date || null,
      note: note.trim() || null,
      type: 'dispatch'
    };

    try {
      const url = editId ? `/api/dispatch-receives/${editId}` : '/api/dispatch-receives';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'Postal dispatch updated successfully!' : 'Postal dispatch recorded successfully!'
        });
        handleReset();
        mutate('/api/dispatch-receives?type=dispatch');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this dispatch record?')) {
      return;
    }
    try {
      const res = await fetch(`/api/dispatch-receives/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/dispatch-receives?type=dispatch');
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <Send size={28} /> Postal Dispatch
        </h2>
        <p className="text-zinc-400 text-sm">Log and track outgoing letters, documents, courier details, and destinations.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Dispatch Record' : 'Record Outgoing Mail'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">To Title (Recipient) *</label>
                <input type="text" className="input-field" placeholder="Name or title of recipient" value={toTitle} onChange={(e) => setToTitle(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reference No</label>
                <input type="text" className="input-field" placeholder="Consignment or reference number" value={refNo} onChange={(e) => setRefNo(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">From Title (Sender)</label>
                <input type="text" className="input-field" placeholder="Sender department or official name" value={fromTitle} onChange={(e) => setFromTitle(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address / Destination</label>
                <input type="text" className="input-field" placeholder="Full delivery address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
                <textarea className="input-field min-h-[80px] resize-none py-1.5" placeholder="Courier service name, track links, etc..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(refNo || toTitle || address || fromTitle || note || editId) && (
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
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Dispatch Registry</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {items.length} records
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading dispatch records...</div>
            ) : items.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>To (Recipient)</th>
                      <th>Reference No</th>
                      <th>From (Sender)</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className={`hover:bg-white/5 transition-colors ${editId === item.id ? 'bg-indigo-500/5' : ''}`}>
                        <td className="font-semibold text-white">{item.to_title}</td>
                        <td className="text-zinc-300 font-mono text-sm">{item.reference_no || '-'}</td>
                        <td className="text-zinc-400 text-sm">{item.from_title || '-'}</td>
                        <td className="text-zinc-400 text-sm">{item.date}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => setSelectedItem(item)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(item)} className={`p-2 rounded-lg transition-colors border ${editId === item.id ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'}`} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No dispatch records found. Record one on the left.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full border-indigo-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedItem.to_title}</h3>
              <p className="text-sm text-zinc-400 font-mono">Postal Dispatch ID: #{selectedItem.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Reference Number</span>
                <span className="text-zinc-200 font-mono">{selectedItem.reference_no || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Sender Title</span>
                <span className="text-zinc-200">{selectedItem.from_title || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Date Dispatched</span>
                <span className="text-zinc-200">{selectedItem.date}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Destination Address</span>
                <span className="text-zinc-200">{selectedItem.address || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Dispatch Notes</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedItem.note || 'No notes added.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
