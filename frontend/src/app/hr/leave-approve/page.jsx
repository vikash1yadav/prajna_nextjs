'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle, Eye, CornerDownRight } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ApproveLeavePage() {
  const { data: leavesRes, isLoading: isLeavesLoading } = useSWR('/api/staff-leaves', fetcher);
  const leaveRequests = leavesRes?.data || [];

  // Modal / Action State
  const [activeRequest, setActiveRequest] = useState(null);
  const [adminRemark, setAdminRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAction = (req) => {
    setActiveRequest(req);
    setAdminRemark(req.admin_remark || '');
  };

  const handleCloseAction = () => {
    setActiveRequest(null);
    setAdminRemark('');
  };

  const handleUpdateStatus = async (status) => {
    if (!activeRequest) return;
    setIsSubmitting(true);

    const payload = {
      id: activeRequest.id,
      admin_remark: adminRemark,
      status: status // 'approve' or 'disapprove'
    };

    try {
      const res = await fetch('/api/staff-leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        mutate('/api/staff-leaves');
        handleCloseAction();
      } else {
        alert(data.message || 'Failed to update leave status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <CalendarCheck size={28} /> Approve Leave Requests
        </h2>
        <p className="text-zinc-400 text-sm">Review, verify, and approve or reject leave submissions from school staff.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Submissions Directory */}
        <div className="col-span-1 lg:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Leave Submissions</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {leaveRequests.length}
              </span>
            </div>

            {isLeavesLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading leave requests...</div>
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
                        <td className="font-semibold text-white">
                          <div>{req.firstname} {req.lastname}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{req.employee_id}</div>
                        </td>
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
                          <button onClick={() => handleOpenAction(req)} className="p-2 text-zinc-400 hover:text-emerald-400 border border-transparent hover:bg-emerald-500/10 rounded-lg transition-colors" title="Review Submission">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No leave requests to show.</div>
            )}
          </div>
        </div>

        {/* Right: Review details (Dynamic sidebar) */}
        <div className="col-span-1 lg:col-span-4">
          {activeRequest ? (
            <div className="glass-card flex flex-col gap-5 border-emerald-500/20 shadow-emerald-950/20">
              <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Review Leave Request</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Staff Member</label>
                  <span className="font-semibold text-white">{activeRequest.firstname} {activeRequest.lastname}</span>
                  <span className="text-xs text-zinc-400 ml-2">({activeRequest.employee_id})</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Leave Type</label>
                    <span className="text-zinc-300">{activeRequest.leave_type}</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Days</label>
                    <span className="text-zinc-300 font-mono font-bold">{activeRequest.leave_days}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Requested Dates</label>
                  <span className="text-zinc-300">{activeRequest.leave_from} to {activeRequest.leave_to}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Employee Reason</label>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-zinc-300 text-xs mt-1 italic">
                    "{activeRequest.employee_remark || 'No remark provided.'}"
                  </div>
                </div>

                {activeRequest.status !== 'pending' && (
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Admin Remark</label>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-zinc-300 text-xs mt-1">
                      "{activeRequest.admin_remark || 'No admin remark.'}"
                    </div>
                  </div>
                )}
              </div>

              {activeRequest.status === 'pending' && (
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4 mt-2">
                  <div className="form-group flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Admin Remark / Feedback</label>
                    <textarea 
                      className="input-field h-20 text-xs" 
                      placeholder="Type comments or reasons for decision..." 
                      value={adminRemark} 
                      onChange={(e) => setAdminRemark(e.target.value)} 
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateStatus('disapprove')} 
                      disabled={isSubmitting} 
                      className="btn btn-secondary text-rose-400 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/30 flex-1 py-2 text-xs"
                    >
                      Disapprove
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('approve')} 
                      disabled={isSubmitting} 
                      className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 flex-1 py-2 text-xs"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card text-center p-12 border-dashed border-white/5 text-zinc-500 flex flex-col items-center justify-center gap-2">
              <CornerDownRight size={24} className="text-zinc-600" />
              <span>Select a leave request to review details and approve/disapprove.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
