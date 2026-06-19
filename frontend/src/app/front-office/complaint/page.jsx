'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { AlertCircle, Plus, Edit2, Trash2, RotateCcw, Eye, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ComplaintPage() {
  const { data: complaintRes, isLoading: isComplaintLoading } = useSWR('/api/complaints', fetcher);
  const { data: typeRes } = useSWR('/api/complaint-types', fetcher);
  const { data: sourceRes } = useSWR('/api/sources', fetcher);

  const complaints = complaintRes?.data || [];
  const complaintTypes = typeRes?.data || [];
  const sources = sourceRes?.data || [];

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [assigned, setAssigned] = useState('');
  const [note, setNote] = useState('');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleEditClick = (c) => {
    setEditId(c.id);
    setName(c.name);
    setContact(c.contact || '');
    setEmail(c.email || '');
    setComplaintType(c.complaint_type || '');
    setSource(c.source || '');
    setDate(c.date || new Date().toISOString().slice(0, 10));
    setDescription(c.description || '');
    setActionTaken(c.action_taken || '');
    setAssigned(c.assigned || '');
    setNote(c.note || '');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setName('');
    setContact('');
    setEmail('');
    setComplaintType('');
    setSource('');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setActionTaken('');
    setAssigned('');
    setNote('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Complainant name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim(),
      contact: contact.trim() || null,
      email: email.trim() || null,
      complaint_type: complaintType || null,
      source: source || null,
      date: date || null,
      description: description.trim() || null,
      action_taken: actionTaken.trim() || null,
      assigned: assigned.trim() || null,
      note: note.trim() || null
    };

    try {
      const url = editId ? `/api/complaints/${editId}` : '/api/complaints';
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
          text: editId ? 'Complaint updated successfully!' : 'Complaint registered successfully!'
        });
        handleReset();
        mutate('/api/complaints');
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
    if (!confirm('Are you sure you want to delete this complaint record?')) {
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/complaints');
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(null);
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
          <AlertCircle size={28} /> Complaint Tracking
        </h2>
        <p className="text-zinc-400 text-sm">Register student, staff, or parent complaints, assign them to personnel, and track resolution steps.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Complaint details' : 'Register Complaint'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Complainant Name *</label>
                <input type="text" className="input-field" placeholder="Name of parent, staff or student" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact No</label>
                  <input type="text" className="input-field" placeholder="Phone number" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Complaint Type</label>
                  <Select value={complaintType || undefined} onValueChange={(val) => setComplaintType(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintTypes.map(t => (
                        <SelectItem key={t.id} value={t.complaint_type}>
                          {t.complaint_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source</label>
                  <Select value={source || undefined} onValueChange={(val) => setSource(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map(s => (
                        <SelectItem key={s.id} value={s.source}>
                          {s.source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                  <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assigned To</label>
                  <input type="text" className="input-field" placeholder="Staff member name" value={assigned} onChange={(e) => setAssigned(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Action Taken</label>
                <input type="text" className="input-field" placeholder="Resolution steps taken" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Details of complaint..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Follow-up notes..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || contact || email || complaintType || source || assigned || actionTaken || description || note || editId) && (
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
              <h3 className="text-lg font-semibold text-white">Complaints Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {complaints.length}
              </span>
            </div>

            {isComplaintLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading complaints...</div>
            ) : complaints.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Complainant</th>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Date</th>
                      <th>Assigned</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id} className={`hover:bg-white/5 transition-colors ${editId === c.id ? 'bg-indigo-500/5' : ''}`}>
                        <td className="font-semibold text-white">{c.name}</td>
                        <td className="text-zinc-300 text-sm">{c.complaint_type || '-'}</td>
                        <td className="text-zinc-400 text-sm">{c.source || '-'}</td>
                        <td className="text-zinc-400 text-sm">{c.date}</td>
                        <td className="text-zinc-300 text-sm">{c.assigned || '-'}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => setSelectedComplaint(c)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
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
              <div className="p-12 text-center text-zinc-500">No complaints registered. Record one on the left.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full border-indigo-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedComplaint(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedComplaint.name}</h3>
              <p className="text-sm text-zinc-400 font-mono">Complaint Record ID: #{selectedComplaint.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Contact Number</span>
                <span className="text-zinc-200 font-mono">{selectedComplaint.contact || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Email Address</span>
                <span className="text-zinc-200">{selectedComplaint.email || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Complaint Type</span>
                <span className="text-zinc-200">{selectedComplaint.complaint_type || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Source Channel</span>
                <span className="text-zinc-200">{selectedComplaint.source || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Assigned Resolver</span>
                <span className="text-zinc-200">{selectedComplaint.assigned || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Complaint Date</span>
                <span className="text-zinc-200">{selectedComplaint.date}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Description of issue</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedComplaint.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Resolution action taken</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedComplaint.action_taken || 'No actions logged yet.'}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Internal Follow-up notes</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedComplaint.note || 'No notes added.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
