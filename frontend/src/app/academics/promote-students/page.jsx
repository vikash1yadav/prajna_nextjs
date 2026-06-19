'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Search, GraduationCap, Save, AlertCircle } from 'lucide-react';

export default function PromoteStudentsPage() {
  const [sessions, setSessions] = useState([
    { id: 1, session: '2025-26' },
    { id: 2, session: '2026-27' }
  ]);
  const [classes, setClasses] = useState([]);
  const [sourceSections, setSourceSections] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  // Filter states
  const [sourceSession, setSourceSession] = useState('1');
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');

  const [targetSession, setTargetSession] = useState('2');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');

  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentActionMap, setStudentActionMap] = useState({}); // student_session_id -> 'promote' | 'retain' | 'leave'

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load classes and sessions
  useEffect(() => {
    async function init() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const sessionsRes = await fetch('/api/sessions');
        const sessionsJson = await sessionsRes.json();
        if (sessionsJson.data && sessionsJson.data.length > 0) {
          setSessions(sessionsJson.data);
        }
      } catch (err) {
        console.warn('Fallback to static session list');
      }
    }
    init();
  }, []);

  // Load source sections
  useEffect(() => {
    if (!sourceClass) {
      setSourceSections([]);
      setSourceSection('');
      return;
    }
    async function loadSections() {
      try {
        const res = await fetch(`/api/classes/${sourceClass}/sections`);
        const json = await res.json();
        setSourceSections(json.data || []);
      } catch (err) {
        showNotification('Failed to load source sections', 'danger');
      }
    }
    loadSections();
  }, [sourceClass]);

  // Load target sections
  useEffect(() => {
    if (!targetClass) {
      setTargetSections([]);
      setTargetSection('');
      return;
    }
    async function loadSections() {
      try {
        const res = await fetch(`/api/classes/${targetClass}/sections`);
        const json = await res.json();
        setTargetSections(json.data || []);
      } catch (err) {
        showNotification('Failed to load target sections', 'danger');
      }
    }
    loadSections();
  }, [targetClass]);

  // Search Students
  const handleSearch = async () => {
    if (!sourceClass || !sourceSection || !sourceSession) {
      showNotification('Please specify source Class, Section, and Session', 'warning');
      return;
    }
    setLoading(true);
    setStudents([]);
    try {
      const res = await fetch(`/api/students?class_id=${sourceClass}&section_id=${sourceSection}&session_id=${sourceSession}`);
      const json = await res.json();
      const list = json.data || [];
      setStudents(list);

      // Default select all and map actions to 'promote'
      const ids = list.map(s => s.id);
      setSelectedStudentIds(ids);

      const actionMap = {};
      list.forEach(s => {
        actionMap[s.id] = 'promote';
      });
      setStudentActionMap(actionMap);
    } catch (err) {
      showNotification('Failed to load students list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(studentId => studentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  const handleActionChange = (studentId, action) => {
    setStudentActionMap(prev => ({
      ...prev,
      [studentId]: action
    }));
  };

  const handlePromote = async () => {
    if (selectedStudentIds.length === 0) {
      showNotification('Please select at least one student to promote', 'warning');
      return;
    }
    if (!targetClass || !targetSection || !targetSession) {
      showNotification('Please select target Class, Section, and Session', 'warning');
      return;
    }
    if (parseInt(sourceSession) === parseInt(targetSession)) {
      showNotification('Destination session must be different from source session', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Split selected students based on their actions
      const studentsToPromote = selectedStudentIds.filter(id => studentActionMap[id] === 'promote');
      const studentsToRetain = selectedStudentIds.filter(id => studentActionMap[id] === 'retain');

      // 1. Promote API call
      if (studentsToPromote.length > 0) {
        await fetch('/api/academics/promote-students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_session_ids: studentsToPromote,
            from_class_id: sourceClass,
            from_section_id: sourceSection,
            to_class_id: targetClass,
            to_section_id: targetSection,
            from_session_id: sourceSession,
            to_session_id: targetSession
          })
        });
      }

      // 2. Retain (Repeat) API call - target class is same as source class, target session is next session
      if (studentsToRetain.length > 0) {
        await fetch('/api/academics/promote-students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_session_ids: studentsToRetain,
            from_class_id: sourceClass,
            from_section_id: sourceSection,
            to_class_id: sourceClass,
            to_section_id: sourceSection,
            from_session_id: sourceSession,
            to_session_id: targetSession
          })
        });
      }

      showNotification('Student promotion processed successfully', 'success');
      setStudents([]);
      setSelectedStudentIds([]);
    } catch (err) {
      showNotification('Error promoting students', 'danger');
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
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-fill-transparent tracking-tight">
          Promote Students
        </h2>
        <p className="text-zinc-400 text-sm">
          Promote or repeat students to next session, class, and section mapping
        </p>
      </div>

      {/* Dual Filter Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Class Section Panel */}
        <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-2">
            Promotion From (Source)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Session</label>
              <select
                value={sourceSession}
                onChange={(e) => setSourceSession(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.session}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Class</label>
              <select
                value={sourceClass}
                onChange={(e) => setSourceClass(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Section</label>
              <select
                value={sourceSection}
                onChange={(e) => setSourceSection(e.target.value)}
                disabled={!sourceClass}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {sourceSections.map(s => (
                  <option key={s.id} value={s.id}>{s.section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Class Section Panel */}
        <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-2">
            Promotion To (Target)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Session</label>
              <select
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.session}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Section</label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                disabled={!targetClass}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {targetSections.map(s => (
                  <option key={s.id} value={s.id}>{s.section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search trigger button */}
      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold border border-white/10 transition-all"
        >
          <Search size={16} /> Search Students
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
          Loading students list...
        </div>
      ) : students.length > 0 ? (
        <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-3 gap-3">
            <h3 className="text-base font-semibold text-white">Select Students for Promotion</h3>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>Total: {students.length}</span>
              <span>Selected: {selectedStudentIds.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === students.length}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20"
                    />
                  </th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4 text-right">Promotion Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map(std => (
                  <tr key={std.id} className="hover:bg-white/[0.01] transition-colors text-zinc-300">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(std.id)}
                        onChange={() => handleSelectStudent(std.id)}
                        className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{std.admission_no}</td>
                    <td className="py-3 px-4">{std.roll_no || 'N/A'}</td>
                    <td className="py-3 px-4">{`${std.firstname} ${std.lastname || ''}`}</td>
                    <td className="py-3 px-4">{std.father_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={studentActionMap[std.id] || 'promote'}
                        onChange={(e) => handleActionChange(std.id, e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="promote">Promote</option>
                        <option value="retain">Repeat/Retain</option>
                        <option value="leave">Leave School</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-zinc-400 text-xs bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-lg">
              <AlertCircle className="text-indigo-400 shrink-0" size={16} />
              <span>
                Clicking promote will map selected students to the target session/class/section.
              </span>
            </div>

            <button
              onClick={handlePromote}
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10"
            >
              <ArrowRightLeft size={16} /> {submitting ? 'Promoting...' : 'Promote Selected'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-zinc-500 text-sm bg-zinc-950/20 border border-white/5 rounded-xl text-center">
          Filter and click &quot;Search Students&quot; to show students for promotion list
        </div>
      )}
    </div>
  );
}
