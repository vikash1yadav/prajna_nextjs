'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Calendar, Trash2, Check, X, RotateCcw, Plus, Search, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ApproveLeavePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  // Filter state
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Form State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentSessionId, setStudentSessionId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applyDate, setApplyDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [docs, setDocs] = useState('');
  const [status, setStatus] = useState('0'); // 0=Pending, 1=Approved, 2=Disapproved

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // SWR for leave requests
  const leavesUrl = `/api/leaves?class_id=${filterClass}&section_id=${filterSection}`;
  const { data: leavesRes, isLoading: isLeavesLoading } = useSWR(leavesUrl, fetcher);
  const leaves = leavesRes?.data || [];

  // Load Classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes');
        const json = await res.json();
        setClasses(json.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadClasses();
  }, []);

  // Load Filter Sections
  useEffect(() => {
    if (!filterClass) {
      setSections([]);
      setFilterSection('');
      return;
    }
    async function loadSections() {
      try {
        const res = await fetch(`/api/classes/${filterClass}/sections`);
        const json = await res.json();
        setSections(json.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadSections();
  }, [filterClass]);

  // Load Form Sections
  const [formSections, setFormSections] = useState([]);
  useEffect(() => {
    if (!selectedClass) {
      setFormSections([]);
      setSelectedSection('');
      return;
    }
    async function loadFormSections() {
      try {
        const res = await fetch(`/api/classes/${selectedClass}/sections`);
        const json = await res.json();
        setFormSections(json.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadFormSections();
  }, [selectedClass]);

  // Load Students for Form
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      setStudentSessionId('');
      return;
    }
    async function loadStudents() {
      try {
        const dateStr = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/attendance/search?class_id=${selectedClass}&section_id=${selectedSection}&date=${dateStr}`);
        const json = await res.json();
        setStudents(json.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, [selectedClass, selectedSection]);

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSection('');
    setStudentSessionId('');
    setFromDate('');
    setToDate('');
    setApplyDate(new Date().toISOString().slice(0, 10));
    setReason('');
    setDocs('');
    setStatus('0');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentSessionId) {
      setStatusMessage({ type: 'error', text: 'Select a student' });
      return;
    }
    if (!fromDate || !toDate) {
      setStatusMessage({ type: 'error', text: 'From and To dates are required' });
      return;
    }
    if (!reason.trim()) {
      setStatusMessage({ type: 'error', text: 'Reason is required' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      student_session_id: parseInt(studentSessionId),
      from_date: fromDate,
      to_date: toDate,
      apply_date: applyDate,
      reason: reason.trim(),
      docs: docs.trim() || null,
      status: parseInt(status)
    };

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Leave request logged successfully!'
        });
        handleReset();
        mutate(leavesUrl);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, staff_id: 1 })
      });
      const data = await res.json();
      if (data.success) {
        mutate(leavesUrl);
      } else {
        alert(data.message || 'Failed to update leave status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave request?')) {
      return;
    }
    try {
      const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate(leavesUrl);
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
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-400 flex items-center gap-2">
          <Calendar size={28} /> Leave Approval
        </h2>
        <p className="text-zinc-400 text-sm">Review, approve, or disapprove leave requests submitted by students. You can also manually add leave requests below.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">Record Student Leave</h3>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class *</label>
                  <Select value={selectedClass || undefined} onValueChange={(val) => setSelectedClass(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.class}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section *</label>
                  <Select value={selectedSection || undefined} onValueChange={(val) => setSelectedSection(val || '')} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {formSections.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Student *</label>
                <Select value={studentSessionId || undefined} onValueChange={(val) => setStudentSessionId(val || '')} disabled={isSubmitting || students.length === 0}>
                  <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                    <SelectValue placeholder={students.length > 0 ? "Select Student" : "Select Class & Section first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(st => (
                      <SelectItem key={st.student_session_id} value={String(st.student_session_id)}>
                        {st.firstname} {st.lastname} ({st.admission_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">From Date *</label>
                  <input type="date" className="input-field" value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">To Date *</label>
                  <input type="date" className="input-field" value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Apply Date</label>
                  <input type="date" className="input-field" value={applyDate} onChange={(e) => setApplyDate(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Initial Status</label>
                  <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Approved</SelectItem>
                      <SelectItem value="2">Disapproved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Document Path / File</label>
                <input type="text" className="input-field" placeholder="doc_url_or_filepath" value={docs} onChange={(e) => setDocs(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reason for Leave *</label>
                <textarea className="input-field min-h-[80px] resize-none py-1.5" placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20">
                  Submit Leave
                </button>
                {(selectedClass || selectedSection || studentSessionId || fromDate || toDate || reason || docs) && (
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
          {/* Class Filter Bar Card */}
          <div className="glass-card flex flex-wrap items-center gap-4 p-4 border-indigo-500/10">
            <div className="flex items-center gap-2">
              <Search className="text-zinc-500" size={18} />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filter Registry:</span>
            </div>

            <div className="w-[180px]">
              <Select value={filterClass || undefined} onValueChange={(val) => setFilterClass(val || '')}>
                <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[38px] !px-3 !text-zinc-300 !rounded-lg flex justify-between items-center text-xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.class}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <Select value={filterSection || undefined} onValueChange={(val) => setFilterSection(val || '')} disabled={!filterClass || filterClass === 'all'}>
                <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[38px] !px-3 !text-zinc-300 !rounded-lg flex justify-between items-center text-xs">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(filterClass || filterSection) && (
              <button
                onClick={() => { setFilterClass(''); setFilterSection(''); }}
                className="text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Leave Requests Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {leaves.length}
              </span>
            </div>

            {isLeavesLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading leave requests...</div>
            ) : leaves.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.id} className="hover:bg-white/5 transition-colors">
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{l.firstname} {l.lastname}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Adm: {l.admission_no}</span>
                          </div>
                        </td>
                        <td className="text-zinc-300 text-sm">{l.class}</td>
                        <td className="text-zinc-300 text-sm">{l.section}</td>
                        <td className="text-zinc-400 text-xs font-mono">
                          {l.from_date} to {l.to_date}
                          <div className="text-[9px] text-zinc-500">Applied: {l.apply_date}</div>
                        </td>
                        <td className="text-zinc-400 text-xs max-w-[150px] truncate" title={l.reason}>
                          {l.reason}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            l.apply_leave_status === 1
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : l.apply_leave_status === 2
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {l.apply_leave_status === 1 ? 'Approved' : l.apply_leave_status === 2 ? 'Disapproved' : 'Pending'}
                          </span>
                        </td>
                        <td className="text-right flex justify-end gap-1.5 p-3">
                          {l.apply_leave_status !== 1 && (
                            <button
                              onClick={() => handleStatusChange(l.id, 1)}
                              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {l.apply_leave_status !== 2 && (
                            <button
                              onClick={() => handleStatusChange(l.id, 2)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent rounded-lg transition-colors"
                              title="Disapprove"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 border border-transparent rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No leave requests logged for the selected filters.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
