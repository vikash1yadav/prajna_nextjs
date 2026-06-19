'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, FileText, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AttendanceByDatePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // UI State
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);

  // Load Classes and Types
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

  // Load Sections when Class changes
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

  const handleSearch = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      setErrorMsg('Please select Class, Section, and Date to search.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/attendance/search?class_id=${selectedClass}&section_id=${selectedSection}&date=${selectedDate}`);
      const json = await res.json();
      setAttendanceList(json.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get attendance type label and color
  const getAttendanceBadge = (typeId) => {
    const type = attendanceTypes.find(t => t.id === typeId);
    const label = type ? type.type : 'Not Marked';

    let colorClasses = 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    if (typeId === 1) {
      colorClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    } else if (typeId === 2) {
      colorClasses = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    } else if (typeId === 3) {
      colorClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    } else if (typeId === 4) {
      colorClasses = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
    }

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${colorClasses}`}>
        {label}
      </span>
    );
  };

  // Statistics calculation
  const total = attendanceList.length;
  const present = attendanceList.filter(item => item.attendence_type_id === 1).length;
  const absent = attendanceList.filter(item => item.attendence_type_id === 2).length;
  const late = attendanceList.filter(item => item.attendence_type_id === 3).length;
  const leave = attendanceList.filter(item => item.attendence_type_id === 4).length;
  const unmarked = attendanceList.filter(item => !item.attendence_type_id).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-400 flex items-center gap-2">
          <Calendar size={28} /> Attendance By Date
        </h2>
        <p className="text-zinc-400 text-sm">View attendance logs and daily attendance metrics for any past date by selecting the Class and Section.</p>
      </div>

      {/* Filter Card */}
      <div className="glass-card flex flex-wrap items-end gap-6 border-indigo-500/10 p-5">
        <div className="form-group flex flex-col gap-1.5 min-w-[200px] flex-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class *</label>
          <Select value={selectedClass || undefined} onValueChange={(val) => setSelectedClass(val || '')}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.class}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="form-group flex flex-col gap-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section *</label>
          <Select value={selectedSection || undefined} onValueChange={(val) => setSelectedSection(val || '')} disabled={!selectedClass}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="form-group flex flex-col gap-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date *</label>
          <input type="date" className="input-field !h-[45px]" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 h-[45px] px-6 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
          Search Logs
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Grid for Summary Statistics and Data table */}
      {searched && !loading && !errorMsg && (
        <div className="flex flex-col gap-6">
          {/* Summary Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card border-white/5 flex flex-col gap-1 py-4 px-5">
              <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Total Strength</span>
              <span className="text-2xl font-bold text-white font-mono">{total}</span>
            </div>
            <div className="glass-card border-emerald-500/10 flex flex-col gap-1 py-4 px-5">
              <span className="text-emerald-500/60 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Present
              </span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{present}</span>
            </div>
            <div className="glass-card border-rose-500/10 flex flex-col gap-1 py-4 px-5">
              <span className="text-rose-500/60 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <XCircle size={12} /> Absent
              </span>
              <span className="text-2xl font-bold text-rose-400 font-mono">{absent}</span>
            </div>
            <div className="glass-card border-amber-500/10 flex flex-col gap-1 py-4 px-5">
              <span className="text-amber-500/60 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={12} /> Late
              </span>
              <span className="text-2xl font-bold text-amber-400 font-mono">{late}</span>
            </div>
            <div className="glass-card border-zinc-500/10 flex flex-col gap-1 py-4 px-5">
              <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Leaves / Not Marked</span>
              <span className="text-2xl font-bold text-zinc-400 font-mono">{leave + unmarked}</span>
            </div>
          </div>

          {/* List Card */}
          <div className="glass-card !p-0 border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Attendance Logs</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Date: {selectedDate}
              </span>
            </div>

            {attendanceList.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Admission No</th>
                      <th>Student Name</th>
                      <th>Attendance Status</th>
                      <th>Remarks / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList.map((st) => (
                      <tr key={st.student_session_id} className="hover:bg-white/5 transition-colors">
                        <td className="text-zinc-300 text-sm font-mono">{st.roll_no || '-'}</td>
                        <td className="text-zinc-400 text-sm font-mono">{st.admission_no}</td>
                        <td className="font-semibold text-white">{st.firstname} {st.lastname}</td>
                        <td>{getAttendanceBadge(st.attendence_type_id)}</td>
                        <td className="text-zinc-400 text-sm">{st.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No attendance logs found for this date. Go to the Attendance Register to mark it.
              </div>
            )}
          </div>
        </div>
      )}

      {!searched && (
        <div className="p-16 border border-dashed border-white/10 rounded-2xl text-center text-zinc-500">
          Select Class, Section, and Date above, then click Search Logs.
        </div>
      )}
    </div>
  );
}
