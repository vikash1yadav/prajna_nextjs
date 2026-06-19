'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, Save, X, Clock, MapPin } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');

  const [timetable, setTimetable] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load classes and staff list
  useEffect(() => {
    async function init() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const staffRes = await fetch('/api/staff');
        const staffJson = await staffRes.json();
        setStaffList(staffJson.data || []);
      } catch (err) {
        showNotification('Failed to initialize page data', 'danger');
      }
    }
    init();
  }, []);

  // Load sections when class changes
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
        showNotification('Failed to load sections', 'danger');
      }
    }
    loadSections();
  }, [selectedClass]);

  // Load subject groups when section changes
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setSubjectGroups([]);
      setSelectedSubjectGroup('');
      return;
    }
    async function loadSubjectGroups() {
      try {
        const res = await fetch('/api/academics/subject-groups?session_id=1');
        const json = await res.json();
        // Filter subject groups that are associated with the selected class-section
        const filtered = (json.data || []).filter(group => 
          group.sections.some(sec => sec.class_id === parseInt(selectedClass) && sec.section_id === parseInt(selectedSection))
        );
        setSubjectGroups(filtered);
      } catch (err) {
        showNotification('Failed to load subject groups', 'danger');
      }
    }
    loadSubjectGroups();
  }, [selectedClass, selectedSection]);

  // Search Timetable
  const handleSearch = async () => {
    if (!selectedClass || !selectedSection || !selectedSubjectGroup) {
      showNotification('Please select Class, Section, and Subject Group', 'warning');
      return;
    }
    setLoading(true);
    setIsEditing(false);
    try {
      const res = await fetch(`/api/academics/timetable?class_id=${selectedClass}&section_id=${selectedSection}&subject_group_id=${selectedSubjectGroup}&session_id=1`);
      const json = await res.json();
      
      // Group timetable items by Day
      const grouped = {};
      DAYS.forEach(day => {
        grouped[day] = [];
      });

      if (json.data && Array.isArray(json.data)) {
        json.data.forEach(item => {
          if (grouped[item.day]) {
            grouped[item.day].push({
              id: item.id,
              subject_group_subject_id: item.subject_group_subject_id,
              staff_id: item.staff_id,
              time_from: item.time_from,
              time_to: item.time_to,
              room_no: item.room_no || '',
              subject_name: item.subject_name || '',
              staff_name: item.staff_name ? `${item.staff_name} ${item.staff_surname || ''}`.trim() : ''
            });
          }
        });
      }

      setTimetable(grouped);
    } catch (err) {
      showNotification('Failed to load timetable', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getActiveGroupSubjects = () => {
    const group = subjectGroups.find(g => g.id === parseInt(selectedSubjectGroup));
    return group ? group.subjects : [];
  };

  // Add new timetable row
  const addSlot = (day) => {
    const subjects = getActiveGroupSubjects();
    const defaultSubject = subjects[0]?.sgs_id || '';
    const defaultTeacher = staffList[0]?.id || '';

    setTimetable(prev => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          id: null,
          subject_group_subject_id: defaultSubject,
          staff_id: defaultTeacher,
          time_from: '09:00 AM',
          time_to: '10:00 AM',
          room_no: '',
          subject_name: '',
          staff_name: ''
        }
      ]
    }));
  };

  // Remove slot row
  const removeSlot = (day, index) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter((_, idx) => idx !== index)
    }));
  };

  // Update slot cell values
  const updateSlot = (day, index, field, value) => {
    setTimetable(prev => {
      const updatedList = [...prev[day]];
      updatedList[index] = { ...updatedList[index], [field]: value };
      return { ...prev, [day]: updatedList };
    });
  };

  // Save Timetable
  const handleSave = async () => {
    setSubmitting(true);
    try {
      // Flatten all entries for backend payload
      const entries = [];
      DAYS.forEach(day => {
        timetable[day].forEach(slot => {
          entries.push({
            day,
            subject_group_subject_id: slot.subject_group_subject_id,
            staff_id: slot.staff_id,
            time_from: slot.time_from,
            time_to: slot.time_to,
            room_no: slot.room_no
          });
        });
      });

      const res = await fetch('/api/academics/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass,
          section_id: selectedSection,
          subject_group_id: selectedSubjectGroup,
          entries,
          session_id: 1
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification('Timetable saved successfully', 'success');
        setIsEditing(false);
        handleSearch(); // Refresh list view
      } else {
        showNotification(json.message || 'Failed to save timetable', 'danger');
      }
    } catch (err) {
      showNotification('Error saving timetable', 'danger');
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-fill-transparent tracking-tight">
            Class Timetable
          </h2>
          <p className="text-zinc-400 text-sm">
            Create, update, and manage weekly class and section schedules
          </p>
        </div>
        {!isEditing && Object.keys(timetable).length > 0 && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <Edit2 size={16} /> Edit Timetable
          </button>
        )}
      </div>

      {/* Search Filter Panel */}
      <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.class}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value="">Select Section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject Group</label>
            <select
              value={selectedSubjectGroup}
              onChange={(e) => setSelectedSubjectGroup(e.target.value)}
              disabled={!selectedSection}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value="">Select Subject Group</option>
              {subjectGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Calendar size={16} /> Load Timetable
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
          Loading timetable schedules...
        </div>
      ) : Object.keys(timetable).length > 0 ? (
        isEditing ? (
          /* TIMETABLE EDITOR */
          <div className="space-y-6">
            {DAYS.map(day => (
              <div key={day} className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-base font-semibold text-white">{day}</h3>
                  <button
                    onClick={() => addSlot(day)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-all border border-white/10"
                  >
                    <Plus size={14} /> Add Slot
                  </button>
                </div>

                {timetable[day].length === 0 ? (
                  <p className="text-zinc-500 text-xs py-2">No slots defined for {day}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {timetable[day].map((slot, index) => (
                      <div key={index} className="p-4 bg-zinc-950/60 border border-white/5 rounded-lg space-y-3 relative group">
                        <button
                          onClick={() => removeSlot(day, index)}
                          className="absolute top-2 right-2 p-1 bg-rose-950/50 hover:bg-rose-500 text-rose-300 hover:text-white rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Subject</label>
                          <select
                            value={slot.subject_group_subject_id}
                            onChange={(e) => updateSlot(day, index, 'subject_group_subject_id', e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                          >
                            {getActiveGroupSubjects().map(sub => (
                              <option key={sub.sgs_id} value={sub.sgs_id}>{sub.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Teacher</label>
                          <select
                            value={slot.staff_id}
                            onChange={(e) => updateSlot(day, index, 'staff_id', e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                          >
                            {staffList.map(st => (
                              <option key={st.id} value={st.id}>{`${st.name} ${st.surname || ''}`.trim()}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Time From</label>
                          <input
                            type="text"
                            value={slot.time_from}
                            onChange={(e) => updateSlot(day, index, 'time_from', e.target.value)}
                            placeholder="e.g. 09:00 AM"
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Time To</label>
                          <input
                            type="text"
                            value={slot.time_to}
                            onChange={(e) => updateSlot(day, index, 'time_to', e.target.value)}
                            placeholder="e.g. 10:00 AM"
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Room No</label>
                          <input
                            type="text"
                            value={slot.room_no}
                            onChange={(e) => updateSlot(day, index, 'room_no', e.target.value)}
                            placeholder="e.g. Room 101"
                            className="w-full bg-zinc-900 border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Editor Action Buttons */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              >
                <Save size={16} /> {submitting ? 'Saving...' : 'Save Timetable'}
              </button>
            </div>
          </div>
        ) : (
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
                      No schedule
                    </div>
                  ) : (
                    timetable[day].map((slot, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/50 border border-white/5 rounded-lg space-y-2 relative group hover:border-indigo-500/30 transition-all">
                        <div className="text-xs font-semibold text-white line-clamp-1">
                          {slot.subject_name}
                        </div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1">
                          {slot.staff_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium pt-1">
                          <Clock size={11} /> {slot.time_from} - {slot.time_to}
                        </div>
                        {slot.room_no && (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                            <MapPin size={11} /> {slot.room_no}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="p-12 text-zinc-500 text-sm bg-zinc-950/20 border border-white/5 rounded-xl text-center">
          Select filters and click &quot;Load Timetable&quot; to inspect class schedule list
        </div>
      )}
    </div>
  );
}
