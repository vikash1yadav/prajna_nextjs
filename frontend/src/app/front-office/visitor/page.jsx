'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { BookOpen, Plus, Edit2, Trash2, RotateCcw, Eye, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function VisitorBookPage() {
  const { data: visitorRes, isLoading: isVisitorLoading } = useSWR('/api/visitors', fetcher);
  const { data: purposeRes } = useSWR('/api/visitor-purposes', fetcher);

  const visitors = visitorRes?.data || [];
  const purposes = purposeRes?.data || [];

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [purpose, setPurpose] = useState('');
  const [idCard, setIdCard] = useState('');
  const [noOfPeople, setNoOfPeople] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [note, setNote] = useState('');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const handleEditClick = (v) => {
    setEditId(v.id);
    setName(v.name);
    setContact(v.contact);
    setPurpose(v.purpose);
    setIdCard(v.id_card || '');
    setNoOfPeople(v.no_of_people || '');
    setDate(v.date || new Date().toISOString().slice(0, 10));
    setInTime(v.in_time || '');
    setOutTime(v.out_time || '');
    setNote(v.note || '');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setName('');
    setContact('');
    setPurpose('');
    setIdCard('');
    setNoOfPeople('');
    setDate(new Date().toISOString().slice(0, 10));
    setInTime('');
    setOutTime('');
    setNote('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Visitor name is required' });
      return;
    }
    if (!contact.trim()) {
      setStatusMessage({ type: 'error', text: 'Visitor contact is required' });
      return;
    }
    if (!purpose.trim()) {
      setStatusMessage({ type: 'error', text: 'Visitor purpose is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      purpose: purpose.trim(),
      id_card: idCard.trim() || null,
      no_of_people: noOfPeople ? parseInt(noOfPeople) : null,
      date: date || null,
      in_time: inTime.trim() || null,
      out_time: outTime.trim() || null,
      note: note.trim() || null
    };

    try {
      const url = editId ? `/api/visitors/${editId}` : '/api/visitors';
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
          text: editId ? 'Visitor updated successfully!' : 'Visitor registered successfully!'
        });
        handleReset();
        mutate('/api/visitors');
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
    if (!confirm('Are you sure you want to delete this visitor record?')) {
      return;
    }
    try {
      const res = await fetch(`/api/visitors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/visitors');
        if (selectedVisitor?.id === id) {
          setSelectedVisitor(null);
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
          <BookOpen size={28} /> Visitors Book
        </h2>
        <p className="text-zinc-400 text-sm">Monitor school visitors, record in/out times, purpose of visit, and host department notifications.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Visitor Details' : 'Record Visitor'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Visitor Name *</label>
                <input type="text" className="input-field" placeholder="Full name of visitor" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact No *</label>
                  <input type="text" className="input-field" placeholder="Phone number" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Purpose *</label>
                                 <Select value={purpose || undefined} onValueChange={(val) => setPurpose(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map(p => (
                        <SelectItem key={p.id} value={p.visitors_purpose}>
                          {p.visitors_purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID Card / Proof</label>
                  <input type="text" className="input-field" placeholder="e.g. Passport, License" value={idCard} onChange={(e) => setIdCard(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">No of Persons</label>
                  <input type="number" className="input-field" placeholder="1" value={noOfPeople} onChange={(e) => setNoOfPeople(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">In Time</label>
                  <input type="text" className="input-field" placeholder="e.g. 10:15 AM" value={inTime} onChange={(e) => setInTime(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Out Time</label>
                  <input type="text" className="input-field" placeholder="e.g. 11:30 AM" value={outTime} onChange={(e) => setOutTime(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
                <textarea className="input-field min-h-[80px] resize-none py-1.5" placeholder="Additional details..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || contact || purpose || idCard || noOfPeople || inTime || outTime || note || editId) && (
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
              <h3 className="text-lg font-semibold text-white">Visitor Registry</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total Logs: {visitors.length}
              </span>
            </div>

            {isVisitorLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading visitor logs...</div>
            ) : visitors.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Contact No</th>
                      <th>Purpose</th>
                      <th>Date</th>
                      <th>In / Out Time</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v) => (
                      <tr key={v.id} className={`hover:bg-white/5 transition-colors ${editId === v.id ? 'bg-indigo-500/5' : ''}`}>
                        <td className="font-semibold text-white">{v.name}</td>
                        <td className="text-zinc-300 font-mono text-sm">{v.contact}</td>
                        <td className="text-zinc-400 text-sm">{v.purpose}</td>
                        <td className="text-zinc-400 text-sm">{v.date}</td>
                        <td className="text-zinc-400 text-sm font-mono">{v.in_time || '-'} / {v.out_time || '-'}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => setSelectedVisitor(v)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(v)} className={`p-2 rounded-lg transition-colors border ${editId === v.id ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'}`} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(v.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No visitors registered. Record one on the left.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full border-indigo-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedVisitor(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedVisitor.name}</h3>
              <p className="text-sm text-zinc-400 font-mono">Visitor Record ID: #{selectedVisitor.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Contact Number</span>
                <span className="text-zinc-200 font-mono">{selectedVisitor.contact}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Purpose of Visit</span>
                <span className="text-zinc-200">{selectedVisitor.purpose}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">ID Card / Proof</span>
                <span className="text-zinc-200">{selectedVisitor.id_card || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">No of Persons</span>
                <span className="text-zinc-200">{selectedVisitor.no_of_people || 1}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Date</span>
                <span className="text-zinc-200">{selectedVisitor.date}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Check In / Out</span>
                <span className="text-zinc-200 font-mono">{selectedVisitor.in_time || '-'} / {selectedVisitor.out_time || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Visitor Note</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedVisitor.note || 'No notes added.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
