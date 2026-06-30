'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Plus, Eye, Trash2 } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ApplyLeavePage() {
  const { data: leavesRes, isLoading: isLeavesLoading } = useSWR('/api/staff-leaves', fetcher);
  const { data: leaveTypeRes } = useSWR('/api/leave-types', fetcher);
  const { data: staffRes } = useSWR('/api/staff?active=1', fetcher);

  const leaveRequests = leavesRes?.data || [];
  const leaveTypes = leaveTypeRes?.data || [];
  const staffList = staffRes?.data || [];

  // Form State
  const [staffId, setStaffId] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!staffId || !leaveTypeId || !leaveFrom || !leaveTo) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    const fromDateObj = new Date(leaveFrom);
    const toDateObj = new Date(leaveTo);
    if (toDateObj < fromDateObj) {
      setStatusMessage({ type: 'error', text: 'To Date cannot be before From Date.' });
      return;
    }

    // Calculate days
    const diffTime = Math.abs(toDateObj - fromDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      staff_id: parseInt(staffId),
      leave_type_id: parseInt(leaveTypeId),
      leave_from: leaveFrom,
      leave_to: leaveTo,
      leave_days: diffDays,
      employee_remark: reason,
      status: 'pending'
    };

    try {
      const res = await fetch('/api/staff-leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Leave request submitted successfully!' });
        setLeaveTypeId('');
        setLeaveFrom('');
        setLeaveTo('');
        setReason('');
        mutate('/api/staff-leaves');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave request?')) {
      return;
    }
    try {
      const res = await fetch(`/api/staff-leaves/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/staff-leaves');
      } else {
        alert(data.message || 'Failed to delete request');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete request');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <Calendar size={28} /> Apply Leave
        </h2>
        <p className="text-zinc-400 text-sm">Submit leave requests and review your history and approval status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Apply Form */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">New Leave Request</h3>

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
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Staff Member *</label>
                <select className="input-field" value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
                  <option value="">Choose Staff</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.surname} ({s.employee_id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Leave Type *</label>
                <select className="input-field" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
                  <option value="">Select Type</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">From Date *</label>
                  <input type="date" className="input-field" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} required />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">To Date *</label>
                  <input type="date" className="input-field" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} required />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reason / Remarks</label>
                <textarea className="input-field h-24" placeholder="Brief explanation..." value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 w-full mt-2">
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Right: History List */}
        <div className="col-span-1 lg:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Leave History</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {leaveRequests.length}
              </span>
            </div>

            {isLeavesLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse animate-pulse">Loading leave requests...</div>
            ) : leaveRequests.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">{req.firstname} {req.lastname}</td>
                        <td className="text-zinc-300">{req.leave_type}</td>
                        <td className="text-zinc-400 text-xs">
                          {req.leave_from} to {req.leave_to}
                        </td>
                        <td className="text-zinc-300 font-mono">{req.leave_days}</td>
                        <td>
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <AlertCircle size={12} /> Pending
                            </span>
                          )}
                          {req.status === 'approve' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
                          {req.status === 'disapprove' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle size={12} /> Disapproved
                            </span>
                          )}
                        </td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          {req.status === 'pending' && (
                            <button onClick={() => handleDelete(req.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No leave requests submitted yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
