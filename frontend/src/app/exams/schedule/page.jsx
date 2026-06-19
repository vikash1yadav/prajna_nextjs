'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Search, AlertCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExamSchedulePage() {
  const [examGroups, setExamGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch('/api/exams/groups');
        const json = await res.json();
        setExamGroups(json.data || []);
      } catch (e) {
        showNotification('Failed to load exam groups', 'error');
      } finally {
        setGroupsLoading(false);
      }
    }
    loadGroups();
  }, []);

  const handleGroupChange = async (val) => {
    setSelectedGroup(val);
    setSelectedExam('');
    setSchedules([]);
    if (!val) {
      setExams([]);
      return;
    }
    try {
      const res = await fetch(`/api/exams/groups/${val}/exams`);
      const json = await res.json();
      setExams(json.data || []);
    } catch (e) {
      showNotification('Failed to load exams', 'error');
    }
  };

  const fetchTimetable = async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/exams/${selectedExam}/subjects`);
      const json = await res.json();
      setSchedules(json.data || []);
    } catch (e) {
      showNotification('Failed to load timetable', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Exam Schedules</h2>
        <p className="text-zinc-400 text-sm">Select an exam group and examination to display the scheduled subject timetables.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-card grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Exam Group</label>
          <Select
            value={selectedGroup}
            onValueChange={handleGroupChange}
            disabled={groupsLoading}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200">
              <SelectValue placeholder={groupsLoading ? "Loading..." : "Select Group"} />
            </SelectTrigger>
            <SelectContent>
              {examGroups.map(g => (
                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Exam</label>
          <Select
            value={selectedExam}
            onValueChange={setSelectedExam}
            disabled={!selectedGroup}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200">
              <SelectValue placeholder="Choose Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.exam}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button 
          onClick={fetchTimetable}
          disabled={!selectedExam || loading}
          className="btn-primary h-[45px] flex items-center justify-center gap-2 font-medium"
        >
          <Search size={16} />
          {loading ? 'Searching...' : 'Search Timetable'}
        </button>
      </div>

      {/* Timetable schedule ledger */}
      <div className="glass-card min-h-[350px] flex flex-col justify-center">
        {selectedExam && schedules.length > 0 ? (
          <div className="h-full flex flex-col justify-start gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar size={18} className="text-indigo-400" />
                Scheduled Timetable
              </h3>
              <span className="text-xs text-zinc-400 font-semibold uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {schedules.length} Subjects Scheduled
              </span>
            </div>

            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam Date</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Room No</th>
                    <th className="text-right">Max / Min Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch, i) => (
                    <tr key={i}>
                      <td>
                        <span className="font-semibold text-white block">{sch.subject_name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{sch.subject_code} &middot; {sch.subject_type}</span>
                      </td>
                      <td>{sch.date_from || 'N/A'}</td>
                      <td>{sch.time_from || 'N/A'}</td>
                      <td>{sch.duration || 'N/A'}</td>
                      <td>
                        {sch.room_no ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Room {sch.room_no}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="text-right font-semibold text-zinc-300">
                        {sch.max_marks} / {sch.min_marks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedExam ? (
          <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
            <AlertCircle size={48} className="stroke-[1.2] text-zinc-600" />
            <span>No subject scheduled mapped for this examination. Go to Exam Group to map subjects.</span>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
            <BookOpen size={48} className="stroke-[1.2] text-zinc-600" />
            <span>Choose search parameters from the filter panel to display the schedule register.</span>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
