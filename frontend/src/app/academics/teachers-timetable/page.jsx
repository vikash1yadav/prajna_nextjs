'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, MapPin, Search } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TeachersTimetablePage() {
  const [staffList, setStaffList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadTeachers() {
      try {
        const res = await fetch('/api/staff');
        const json = await res.json();
        setStaffList(json.data || []);
      } catch (err) {
        showNotification('Failed to load teachers list', 'danger');
      }
    }
    loadTeachers();
  }, []);

  const handleSearch = async () => {
    if (!selectedTeacher) {
      showNotification('Please select a teacher', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/academics/timetable/teacher/${selectedTeacher}?session_id=1`);
      const json = await res.json();

      const grouped = {};
      DAYS.forEach(day => {
        grouped[day] = [];
      });

      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(item => {
          if (grouped[item.day]) {
            grouped[item.day].push({
              id: item.id,
              class_name: item.class_name || '',
              section_name: item.section_name || '',
              subject_name: item.subject_name || '',
              subject_code: item.subject_code || '',
              time_from: item.time_from,
              time_to: item.time_to,
              room_no: item.room_no || ''
            });
          }
        });
      }

      setTimetable(grouped);
    } catch (err) {
      showNotification('Failed to load teacher timetable', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg border text-sm flex items-center shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' :
          toast.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-200' :
          toast.type === 'danger' ? 'bg-rose-950/80 border-rose-500/30 text-rose-200' :
          'bg-zinc-900/80 border-zinc-500/30 text-zinc-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-fill-transparent tracking-tight">
          Teachers Timetable
        </h2>
        <p className="text-zinc-400 text-sm">
          View weekly schedules and lecture assignments for teachers
        </p>
      </div>

      {/* Filter panel */}
      <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Teacher</label>
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 pl-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="">Select Teacher</option>
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>
                    {`${st.name} ${st.surname || ''} (${st.employee_id || 'N/A'})`}
                  </option>
                ))}
              </select>
              <User className="absolute left-3.5 top-3 text-zinc-500" size={16} />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all border border-indigo-500/30 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            <Search size={16} /> Search Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
          Loading schedule data...
        </div>
      ) : Object.keys(timetable).length > 0 ? (
        /* WEEKLY CALENDAR VIEW */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS.map(day => (
            <div key={day} className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl flex flex-col h-full min-h-[300px]">
              <h3 className="text-sm font-bold text-indigo-400 border-b border-white/5 pb-2 mb-3">
                {day}
              </h3>
              <div className="flex-grow space-y-3">
                {timetable[day].length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-600 text-xs py-10 font-medium">
                    No classes
                  </div>
                ) : (
                  timetable[day].map((slot, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/50 border border-white/5 rounded-lg space-y-2 relative group hover:border-indigo-500/30 transition-all">
                      <div className="text-xs font-semibold text-white line-clamp-1">
                        {slot.subject_name}
                      </div>
                      <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                        {slot.class_name} - {slot.section_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium pt-1">
                        <Clock size={11} /> {slot.time_from} - {slot.time_to}
                      </div>
                      {slot.room_no && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                          <MapPin size={11} /> Room: {slot.room_no}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-zinc-500 text-sm bg-zinc-950/20 border border-white/5 rounded-xl text-center">
          Select a teacher and search to show weekly lectures schedule
        </div>
      )}
    </div>
  );
}
