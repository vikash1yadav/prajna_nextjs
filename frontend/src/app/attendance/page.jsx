'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, RefreshCw, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const typesRes = await fetch('/api/attendance/types');
        const typesJson = await typesRes.json();
        setAttendanceTypes(typesJson.data || []);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      setSelectedSection('');
      return;
    }
    async function loadSections() {
      try {
        const res = await fetch(`/api/classes/${selectedClass}/sections`);
        const json = await res.json();
        setSections(json.data || []);
      } catch (err) {
        console.error('Failed to load sections', err);
      }
    }
    loadSections();
  }, [selectedClass]);

  const loadRegister = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      showNotification('Please specify Class, Section, and Date', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/search?class_id=${selectedClass}&section_id=${selectedSection}&date=${selectedDate}`);
      const json = await res.json();
      const list = json.data || [];
      const initialized = list.map(item => ({
        id: item.student_attendance_id || null,
        student_session_id: item.student_session_id,
        admission_no: item.admission_no,
        roll_no: item.roll_no,
        name: `${item.firstname || ''} ${item.middlename || ''} ${item.lastname || ''}`.trim(),
        attendence_type_id: item.attendence_type_id || 1,
        remark: item.remark || ''
      }));
      setAttendanceList(initialized);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load register', err);
      showNotification('Failed to load class register', 'danger');
      setLoading(false);
    }
  };

  const handleTypeChange = (studentSessionId, typeId) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.student_session_id === studentSessionId) {
        return { ...item, attendence_type_id: parseInt(typeId) };
      }
      return item;
    }));
  };

  const handleRemarkChange = (studentSessionId, remark) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.student_session_id === studentSessionId) {
        return { ...item, remark };
      }
      return item;
    }));
  };

  const bulkSetAttendance = (typeId) => {
    setAttendanceList(prev => prev.map(item => ({
      ...item,
      attendence_type_id: parseInt(typeId)
    })));
    showNotification(`Bulk set all students to status`, 'info');
  };

  const saveRegister = async () => {
    setSubmitting(true);
    try {
      const payload = attendanceList.map(item => ({
        id: item.id,
        student_session_id: item.student_session_id,
        attendence_type_id: item.attendence_type_id,
        date: selectedDate,
        remark: item.remark
      }));

      const res = await fetch('/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances: payload })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Attendance sheet saved successfully', 'success');
        loadRegister();
      } else {
        showNotification(json.error?.message || 'Failed to save attendance', 'danger');
      }
    } catch (err) {
      console.error('Failed saving attendance', err);
      showNotification('Error saving attendance register', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Daily Attendance Register</h2>
        <p className="text-zinc-400 text-sm">Search and record daily student presence records.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-card flex flex-wrap gap-4 items-center">
        <div className="min-w-[160px]">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Class</label>
          <Select
            value={selectedClass || "all"}
            onValueChange={(val) => {
              setSelectedClass(val === "all" ? "" : val);
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Choose Class</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Section</label>
          <Select
            value={selectedSection || "all"}
            onValueChange={(val) => setSelectedSection(val === "all" ? "" : val)}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Choose Section</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Date</label>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="pt-[22px]">
          <button type="button" className="btn btn-primary h-[48px]" onClick={loadRegister}>
            <RefreshCw size={16} /> Load Sheet
          </button>
        </div>
      </div>

      {attendanceList.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Bulk Action Panel */}
          <div className="glass-card flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">Bulk Actions:</span>
            </div>
            <div className="flex gap-2">
              {attendanceTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className="btn btn-secondary !px-3 !py-1.5 !text-xs"
                  onClick={() => bulkSetAttendance(t.id)}
                >
                  Mark All {t.type}
                </button>
              ))}
            </div>
          </div>

          {/* Student attendance table */}
          <div className="glass-card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-zinc-400">Loading student list...</div>
            ) : (
              <div className="table-container !mt-0 !border-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm. No</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Status Mapping</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList.map(st => (
                      <tr key={st.student_session_id}>
                        <td><span className="font-mono text-purple-400 font-semibold">{st.admission_no}</span></td>
                        <td>{st.roll_no || 'N/A'}</td>
                        <td className="font-medium text-white">{st.name}</td>
                        <td>
                          <div className="flex gap-4">
                            {attendanceTypes.map(t => {
                              const isChecked = st.attendence_type_id === t.id;
                              let pillColor = 'border-white/30';
                              if (isChecked) {
                                if (t.id === 1) pillColor = 'bg-emerald-500 border-emerald-500';
                                if (t.id === 2) pillColor = 'bg-rose-500 border-rose-500';
                                if (t.id === 3) pillColor = 'bg-amber-500 border-amber-500';
                                if (t.id === 4) pillColor = 'bg-indigo-500 border-indigo-500';
                              }
                              return (
                                <label key={t.id} className="cursor-pointer flex items-center gap-1.5 text-xs">
                                  <input
                                    type="radio"
                                    name={`attendance_${st.student_session_id}`}
                                    className="hidden"
                                    checked={isChecked}
                                    onChange={() => handleTypeChange(st.student_session_id, t.id)}
                                  />
                                  <span className={`w-3.5 h-3.5 rounded-full border ${pillColor} inline-block`}></span>
                                  <span className={isChecked ? 'text-white font-semibold' : 'text-zinc-400'}>{t.type}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="input-field !py-1.5 !px-3 !text-xs !bg-transparent"
                            placeholder="Enter remarks..."
                            value={st.remark}
                            onChange={(e) => handleRemarkChange(st.student_session_id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" onClick={saveRegister} disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving Sheet...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
