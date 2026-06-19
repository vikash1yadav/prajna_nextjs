'use client';

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, HelpCircle, Save } from 'lucide-react';

export default function CopyOldLessonsPage() {
  const [sessions, setSessions] = useState([
    { id: 1, session: '2025-26' },
    { id: 2, session: '2026-27' }
  ]);
  const [classes, setClasses] = useState([]);

  // Source filters
  const [sourceSession, setSourceSession] = useState('1');
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');
  const [sourceSections, setSourceSections] = useState([]);
  const [sourceSubjectGroups, setSourceSubjectGroups] = useState([]);
  const [sourceSubjectGroup, setSourceSubjectGroup] = useState('');
  const [sourceSubjects, setSourceSubjects] = useState([]);
  const [sourceSubject, setSourceSubject] = useState(''); // Stores subject_group_subject_id (sgs_id)

  // Target filters
  const [targetSession, setTargetSession] = useState('2');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const [targetSections, setTargetSections] = useState([]);
  const [targetSubjectGroups, setTargetSubjectGroups] = useState([]);
  const [targetSubjectGroup, setTargetSubjectGroup] = useState('');
  const [targetSubjects, setTargetSubjects] = useState([]);
  const [targetSubject, setTargetSubject] = useState(''); // Stores subject_group_subject_id (sgs_id)

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

  // Source Sections Loader
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

  // Target Sections Loader
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

  // Source Subject Groups Loader
  useEffect(() => {
    if (!sourceClass || !sourceSection) {
      setSourceSubjectGroups([]);
      setSourceSubjectGroup('');
      return;
    }
    async function loadGroups() {
      try {
        const res = await fetch(`/api/academics/subject-groups?session_id=${sourceSession}`);
        const json = await res.json();
        const filtered = (json.data || []).filter(group =>
          group.sections.some(sec => sec.class_id === parseInt(sourceClass) && sec.section_id === parseInt(sourceSection))
        );
        setSourceSubjectGroups(filtered);
      } catch (err) {
        showNotification('Failed to load source subject groups', 'danger');
      }
    }
    loadGroups();
  }, [sourceClass, sourceSection, sourceSession]);

  // Target Subject Groups Loader
  useEffect(() => {
    if (!targetClass || !targetSection) {
      setTargetSubjectGroups([]);
      setTargetSubjectGroup('');
      return;
    }
    async function loadGroups() {
      try {
        const res = await fetch(`/api/academics/subject-groups?session_id=${targetSession}`);
        const json = await res.json();
        const filtered = (json.data || []).filter(group =>
          group.sections.some(sec => sec.class_id === parseInt(targetClass) && sec.section_id === parseInt(targetSection))
        );
        setTargetSubjectGroups(filtered);
      } catch (err) {
        showNotification('Failed to load target subject groups', 'danger');
      }
    }
    loadGroups();
  }, [targetClass, targetSection, targetSession]);

  // Source Subjects Dropdown Loader
  useEffect(() => {
    if (!sourceSubjectGroup) {
      setSourceSubjects([]);
      setSourceSubject('');
      return;
    }
    const group = sourceSubjectGroups.find(g => g.id === parseInt(sourceSubjectGroup));
    setSourceSubjects(group ? group.subjects : []);
  }, [sourceSubjectGroup, sourceSubjectGroups]);

  // Target Subjects Dropdown Loader
  useEffect(() => {
    if (!targetSubjectGroup) {
      setTargetSubjects([]);
      setTargetSubject('');
      return;
    }
    const group = targetSubjectGroups.find(g => g.id === parseInt(targetSubjectGroup));
    setTargetSubjects(group ? group.subjects : []);
  }, [targetSubjectGroup, targetSubjectGroups]);

  const handleCopy = async () => {
    if (!sourceClass || !sourceSection || !sourceSubjectGroup || !sourceSubject) {
      showNotification('Please select all source fields', 'warning');
      return;
    }
    if (!targetClass || !targetSection || !targetSubjectGroup || !targetSubject) {
      showNotification('Please select all target fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/lesson-plan/copy-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_class_section_id: sourceSection, // matches section_id (class_section table entry)
          from_subject_group_subject_id: sourceSubject,
          to_class_section_id: targetSection,
          to_subject_group_subject_id: targetSubject,
          from_session_id: sourceSession,
          to_session_id: targetSession
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification(json.message || 'Lessons and topics copied successfully!', 'success');
        resetSelectors();
      } else {
        showNotification(json.message || 'Failed to copy lessons', 'danger');
      }
    } catch (err) {
      showNotification('Error copying lessons', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const resetSelectors = () => {
    setSourceClass('');
    setSourceSection('');
    setSourceSubjectGroup('');
    setSourceSubject('');

    setTargetClass('');
    setTargetSection('');
    setTargetSubjectGroup('');
    setTargetSubject('');
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
          Copy Old Lessons
        </h2>
        <p className="text-zinc-400 text-sm">
          Copy syllabus blueprints, including lessons and topics, from past sessions to a new session
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Configuration */}
        <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
          <h3 className="text-base font-semibold text-white border-b border-white/5 pb-2">
            Copy From (Source)
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Session</label>
              <select
                value={sourceSession}
                onChange={(e) => setSourceSession(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.session}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
                <select
                  value={sourceClass}
                  onChange={(e) => setSourceClass(e.target.value)}
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
                  value={sourceSection}
                  onChange={(e) => setSourceSection(e.target.value)}
                  disabled={!sourceClass}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {sourceSections.map(s => (
                    <option key={s.id} value={s.id}>{s.section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject Group</label>
                <select
                  value={sourceSubjectGroup}
                  onChange={(e) => setSourceSubjectGroup(e.target.value)}
                  disabled={!sourceSection}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Group</option>
                  {sourceSubjectGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject</label>
                <select
                  value={sourceSubject}
                  onChange={(e) => setSourceSubject(e.target.value)}
                  disabled={!sourceSubjectGroup}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Subject</option>
                  {sourceSubjects.map(sub => (
                    <option key={sub.sgs_id} value={sub.sgs_id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Target Configuration */}
        <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
          <h3 className="text-base font-semibold text-white border-b border-white/5 pb-2">
            Copy To (Target)
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Session</label>
              <select
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.session}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
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
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  disabled={!targetClass}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {targetSections.map(s => (
                    <option key={s.id} value={s.id}>{s.section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject Group</label>
                <select
                  value={targetSubjectGroup}
                  onChange={(e) => setTargetSubjectGroup(e.target.value)}
                  disabled={!targetSection}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Group</option>
                  {targetSubjectGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject</label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  disabled={!targetSubjectGroup}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Subject</option>
                  {targetSubjects.map(sub => (
                    <option key={sub.sgs_id} value={sub.sgs_id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Tip and Action Block */}
      <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="text-zinc-500 mt-0.5 shrink-0" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-white">Attention Planner</h4>
            <p className="text-zinc-400 text-xs mt-0.5 max-w-lg">
              This copy action duplicates all lesson names and their respective topic names. It resets the status of all copied topics to incomplete in the target session.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          disabled={submitting}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10 shrink-0 w-full md:w-auto justify-center"
        >
          <Copy size={16} /> {submitting ? 'Copying...' : 'Copy Lessons Blueprint'}
        </button>
      </div>
    </div>
  );
}
