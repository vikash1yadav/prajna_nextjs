'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { PhoneCall, Plus, Edit2, Trash2, RotateCcw, Eye, X } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function AdmissionEnquiryPage() {
  const { data: enquiryRes, isLoading: isEnquiryLoading } = useSWR('/api/enquiries', fetcher);
  const { data: staffRes } = useSWR('/api/staff', fetcher);
  const { data: classRes } = useSWR('/api/classes', fetcher);
  const { data: sourceRes } = useSWR('/api/sources', fetcher);
  const { data: referenceRes } = useSWR('/api/references', fetcher);

  const enquiries = enquiryRes?.data || [];
  const staffList = staffRes?.data || [];
  const classes = classRes?.data || [];
  const sources = sourceRes?.data || [];
  const references = referenceRes?.data || [];

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [followUpDate, setFollowUpDate] = useState('');
  const [source, setSource] = useState('');
  const [reference, setReference] = useState('');
  const [assigned, setAssigned] = useState('');
  const [classId, setClassId] = useState('');
  const [noOfChild, setNoOfChild] = useState('');
  const [status, setStatus] = useState('active');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Filters State
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Filtered Enquiries
  const filteredEnquiries = enquiries.filter(enq => {
    const matchStatus = filterStatus === 'all' || enq.status === filterStatus;
    const matchSource = filterSource === 'all' || enq.source === filterSource;
    return matchStatus && matchSource;
  });

  const handleEditClick = (enq) => {
    setEditId(enq.id);
    setName(enq.name);
    setContact(enq.contact);
    setEmail(enq.email || '');
    setAddress(enq.address || '');
    setDescription(enq.description || '');
    setNote(enq.note || '');
    setDate(enq.date || new Date().toISOString().slice(0, 10));
    setFollowUpDate(enq.follow_up_date || '');
    setSource(enq.source || '');
    setReference(enq.reference || '');
    setAssigned(enq.assigned || '');
    setClassId(enq.class_id || '');
    setNoOfChild(enq.no_of_child || '');
    setStatus(enq.status || 'active');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setName('');
    setContact('');
    setEmail('');
    setAddress('');
    setDescription('');
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    setFollowUpDate('');
    setSource('');
    setReference('');
    setAssigned('');
    setClassId('');
    setNoOfChild('');
    setStatus('active');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Enquirer name is required' });
      return;
    }
    if (!contact.trim()) {
      setStatusMessage({ type: 'error', text: 'Contact number is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || null,
      address: address.trim() || null,
      description: description.trim() || null,
      note: note.trim() || null,
      date: date || null,
      follow_up_date: followUpDate || null,
      source: source || null,
      reference: reference || null,
      assigned: assigned ? parseInt(assigned) : null,
      class_id: classId ? parseInt(classId) : null,
      no_of_child: noOfChild.trim() || null,
      status
    };

    try {
      const url = editId ? `/api/enquiries/${editId}` : '/api/enquiries';
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
          text: editId ? 'Enquiry updated successfully!' : 'Enquiry registered successfully!'
        });
        handleReset();
        mutate('/api/enquiries');
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
    if (!confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/enquiries');
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(null);
        }
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const getStatusBadge = (statusName) => {
    switch (statusName) {
      case 'won':
        return <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full uppercase font-medium">Won</span>;
      case 'lost':
        return <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-2.5 py-0.5 rounded-full uppercase font-medium">Lost</span>;
      case 'passive':
        return <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full uppercase font-medium">Passive</span>;
      default:
        return <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full uppercase font-medium">Active</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <PhoneCall size={28} /> Admission Enquiry
        </h2>
        <p className="text-zinc-400 text-sm">Track and manage prospective student admission enquiries, sources, references, and follow-up schedules.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Enquiry' : 'Register Enquiry'}
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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Enquirer Name *</label>
                <input type="text" className="input-field" placeholder="Parent or student name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact No *</label>
                  <input type="text" className="input-field" placeholder="Phone number" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address</label>
                <input type="text" className="input-field" placeholder="Current address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reference</label>
                  <Select value={reference || undefined} onValueChange={(val) => setReference(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Reference" />
                    </SelectTrigger>
                    <SelectContent>
                      {references.map(r => (
                        <SelectItem key={r.id} value={r.reference}>
                          {r.reference}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class</label>
                  <Select value={classId ? String(classId) : undefined} onValueChange={(val) => setClassId(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">No of Children</label>
                  <input type="text" className="input-field" placeholder="1" value={noOfChild} onChange={(e) => setNoOfChild(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                  <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Next Follow-up Date</label>
                  <input type="date" className="input-field" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assign To</label>
                  <Select value={assigned ? String(assigned) : undefined} onValueChange={(val) => setAssigned(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} ({s.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                  <Select value={status || undefined} onValueChange={(val) => setStatus(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="passive">Passive</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Enquiry details..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
                <textarea className="input-field min-h-[60px] resize-none py-1.5" placeholder="Additional notes..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || contact || email || address || description || note || followUpDate || source || reference || assigned || classId || noOfChild || editId) && (
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
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Filter Status</label>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val)}>
                <SelectTrigger className="!w-[130px] !bg-white/5 !border-white/5 !h-[32px] !px-2.5 !text-xs !text-zinc-300 !rounded-lg flex justify-between items-center">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="passive">Passive</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Filter Source</label>
              <Select value={filterSource} onValueChange={(val) => setFilterSource(val)}>
                <SelectTrigger className="!w-[130px] !bg-white/5 !border-white/5 !h-[32px] !px-2.5 !text-xs !text-zinc-300 !rounded-lg flex justify-between items-center">
                  <SelectValue placeholder="Filter Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(s => (
                    <SelectItem key={s.id} value={s.source}>
                      {s.source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-xs text-zinc-400 font-mono self-end py-1">
              Showing {filteredEnquiries.length} of {enquiries.length}
            </div>
          </div>

          {/* List Card */}
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Enquiry Directory</h3>
            </div>

            {isEnquiryLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading enquiries...</div>
            ) : filteredEnquiries.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Enquirer</th>
                      <th>Contact No</th>
                      <th>Enquiry Date</th>
                      <th>Next Follow-up</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map((enq) => {
                      const staff = staffList.find(s => s.id === enq.assigned);
                      return (
                        <tr key={enq.id} className={`hover:bg-white/5 transition-colors ${editId === enq.id ? 'bg-indigo-500/5' : ''}`}>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{enq.name}</span>
                              <span className="text-[11px] text-zinc-400">{enq.source || 'Direct Visit'}</span>
                            </div>
                          </td>
                          <td className="text-zinc-300 font-mono text-sm">{enq.contact}</td>
                          <td className="text-zinc-400 text-sm">{enq.date}</td>
                          <td className="text-zinc-400 text-sm">{enq.follow_up_date || '-'}</td>
                          <td>{getStatusBadge(enq.status)}</td>
                          <td className="text-right flex justify-end gap-2 p-3">
                            <button onClick={() => setSelectedEnquiry(enq)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handleEditClick(enq)} className={`p-2 rounded-lg transition-colors border ${editId === enq.id ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'}`} title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteClick(enq.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No enquiries found matching filters.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full border-indigo-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedEnquiry(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-white">{selectedEnquiry.name}</h3>
                {getStatusBadge(selectedEnquiry.status)}
              </div>
              <p className="text-sm text-zinc-400 font-mono">Enquiry Reference ID: #{selectedEnquiry.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Contact Number</span>
                <span className="text-zinc-200 font-mono">{selectedEnquiry.contact}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Email Address</span>
                <span className="text-zinc-200">{selectedEnquiry.email || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Address</span>
                <span className="text-zinc-200">{selectedEnquiry.address || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Class Enquired For</span>
                <span className="text-zinc-200">{classes.find(c => c.id === selectedEnquiry.class_id)?.class || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Source</span>
                <span className="text-zinc-200">{selectedEnquiry.source || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Reference</span>
                <span className="text-zinc-200">{selectedEnquiry.reference || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Enquiry Date</span>
                <span className="text-zinc-200">{selectedEnquiry.date}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Follow-up Date</span>
                <span className="text-zinc-200">{selectedEnquiry.follow_up_date || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Assigned Staff</span>
                <span className="text-zinc-200">{staffList.find(s => s.id === selectedEnquiry.assigned)?.name || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">No of Children</span>
                <span className="text-zinc-200">{selectedEnquiry.no_of_child || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Description</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedEnquiry.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Internal Notes</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[60px] whitespace-pre-wrap">{selectedEnquiry.note || 'No notes added.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
