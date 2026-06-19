'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Phone, Plus, Edit2, Trash2, RotateCcw, Eye, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function PhoneCallLogPage() {
  const { data: callRes, isLoading: isCallLoading } = useSWR('/api/general-calls', fetcher);
  const calls = callRes?.data || [];

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [followUpDate, setFollowUpDate] = useState('');
  const [callDuration, setCallDuration] = useState('');
  const [callType, setCallType] = useState('Incoming');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);

  // Filter State
  const [filterType, setFilterType] = useState('all');

  const filteredCalls = calls.filter(c => {
    return filterType === 'all' || c.call_type === filterType;
  });

  const handleEditClick = (c) => {
    setEditId(c.id);
    setName(c.name || '');
    setContact(c.contact);
    setDate(c.date || new Date().toISOString().slice(0, 10));
    setFollowUpDate(c.follow_up_date || '');
    setCallDuration(c.call_duration || '');
    setCallType(c.call_type || 'Incoming');
    setDescription(c.description || '');
    setNote(c.note || '');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setName('');
    setContact('');
    setDate(new Date().toISOString().slice(0, 10));
    setFollowUpDate('');
    setCallDuration('');
    setCallType('Incoming');
    setDescription('');
    setNote('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.trim()) {
      setStatusMessage({ type: 'error', text: 'Contact number is required' });
      return;
    }
    if (!callType.trim()) {
      setStatusMessage({ type: 'error', text: 'Call type is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim() || null,
      contact: contact.trim(),
      date: date || null,
      follow_up_date: followUpDate || null,
      call_duration: callDuration.trim() || null,
      call_type: callType,
      description: description.trim() || null,
      note: note.trim() || null
    };

    try {
      const url = editId ? `/api/general-calls/${editId}` : '/api/general-calls';
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
          text: editId ? 'Call record updated successfully!' : 'Call record registered successfully!'
        });
        handleReset();
        mutate('/api/general-calls');
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
    if (!confirm('Are you sure you want to delete this call log?')) {
      return;
    }
    try {
      const res = await fetch(`/api/general-calls/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/general-calls');
        if (selectedCall?.id === id) {
          setSelectedCall(null);
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
          <Phone size={28} /> Phone Call Log
        </h2>
        <p className="text-zinc-400 text-sm">Document incoming and outgoing calls, duration, purpose, and follow-up reminders.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Call Record' : 'Record Call Log'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Name</label>
                <input type="text" className="input-field" placeholder="Caller or recipient name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone Number *</label>
                  <input type="text" className="input-field" placeholder="Contact number" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Call Type *</label>
                  <Select value={callType || undefined} onValueChange={(val) => setCallType(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Call Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Incoming">Incoming</SelectItem>
                      <SelectItem value="Outgoing">Outgoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Call Date</label>
                  <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Next Follow-up</label>
                  <input type="date" className="input-field" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Call Duration</label>
                <input type="text" className="input-field" placeholder="e.g. 5m 30s" value={callDuration} onChange={(e) => setCallDuration(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Call conversation details..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Next action points..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || contact || followUpDate || callDuration || description || note || editId) && (
                  <button type="button" onClick={handleReset} className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5" title="Reset Form">
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Data Grid Panel */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="glass-card flex gap-4 items-center flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Filter Call Type</label>
              <Select value={filterType} onValueChange={(val) => setFilterType(val)}>
                <SelectTrigger className="!w-[130px] !bg-white/5 !border-white/5 !h-[32px] !px-2.5 !text-xs !text-zinc-300 !rounded-lg flex justify-between items-center">
                  <SelectValue placeholder="Filter Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-xs text-zinc-400 font-mono self-end py-1">
              Showing {filteredCalls.length} of {calls.length} Logs
            </div>
          </div>

          {/* List Card */}
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Call Log Directory</h3>
            </div>

            {isCallLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading call logs...</div>
            ) : filteredCalls.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Contact Name</th>
                      <th>Phone Number</th>
                      <th>Call Type</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((c) => (
                      <tr key={c.id} className={`hover:bg-white/5 transition-colors ${editId === c.id ? 'bg-indigo-500/5' : ''}`}>
                        <td className="font-semibold text-white">{c.name || 'Anonymous'}</td>
                        <td className="text-zinc-300 font-mono text-sm">{c.contact}</td>
                        <td>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase font-medium ${
                            c.call_type === 'Incoming' 
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          }`}>{c.call_type}</span>
                        </td>
                        <td className="text-zinc-400 text-sm">{c.date}</td>
                        <td className="text-zinc-400 text-sm font-mono">{c.call_duration || '-'}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => setSelectedCall(c)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(c)} className={`p-2 rounded-lg transition-colors border ${editId === c.id ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'}`} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(c.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No call logs registered. Record one on the left.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full border-indigo-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedCall(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-white">{selectedCall.name || 'Anonymous'}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase font-medium ${
                  selectedCall.call_type === 'Incoming' 
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                    : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}>{selectedCall.call_type}</span>
              </div>
              <p className="text-sm text-zinc-400 font-mono">Call Log ID: #{selectedCall.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Phone Number</span>
                <span className="text-zinc-200 font-mono">{selectedCall.contact}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Call Date</span>
                <span className="text-zinc-200">{selectedCall.date}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Call Duration</span>
                <span className="text-zinc-200 font-mono">{selectedCall.call_duration || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Follow-up Date</span>
                <span className="text-zinc-200">{selectedCall.follow_up_date || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Call Description</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedCall.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Follow-up Note</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedCall.note || 'No notes added.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
