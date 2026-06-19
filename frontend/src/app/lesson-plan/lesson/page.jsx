'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, BookOpen, Search, RefreshCw } from 'lucide-react';

export default function LessonPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filter selections
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Lesson list data
  const [lessons, setLessons] = useState([]);

  // Form states
  const [lessonId, setLessonId] = useState(null);
  const [lessonName, setLessonName] = useState('');

  // Active form selectors (can differ from filter panel if needed, but defaults to filters)
  const [formClass, setFormClass] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formSections, setFormSections] = useState([]);
  const [formSubjectGroups, setFormSubjectGroups] = useState([]);
  const [formSubjectGroup, setFormSubjectGroup] = useState('');
  const [formSubjects, setFormSubjects] = useState([]);
  const [formSubject, setFormSubject] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load classes
  useEffect(() => {
    async function init() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);
      } catch (err) {
        showNotification('Failed to initialize classes filter', 'danger');
      }
    }
    init();
  }, []);

  // Filter Panel Sections
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
        showNotification('Failed to load filter sections', 'danger');
      }
    }
    loadSections();
  }, [selectedClass]);

  // Form Panel Sections
  useEffect(() => {
    if (!formClass) {
      setFormSections([]);
      setFormSection('');
      return;
    }
    async function loadSections() {
      try {
        const res = await fetch(`/api/classes/${formClass}/sections`);
        const json = await res.json();
        setFormSections(json.data || []);
      } catch (err) {
        showNotification('Failed to load form sections', 'danger');
      }
    }
    loadSections();
  }, [formClass]);

  // Filter Panel Groups
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
        const filtered = (json.data || []).filter(group =>
          group.sections.some(sec => sec.class_id === parseInt(selectedClass) && sec.section_id === parseInt(selectedSection))
        );
        setSubjectGroups(filtered);
      } catch (err) {
        showNotification('Failed to load filter subject groups', 'danger');
      }
    }
    loadSubjectGroups();
  }, [selectedClass, selectedSection]);

  // Form Panel Groups
  useEffect(() => {
    if (!formClass || !formSection) {
      setFormSubjectGroups([]);
      setFormSubjectGroup('');
      return;
    }
    async function loadSubjectGroups() {
      try {
        const res = await fetch('/api/academics/subject-groups?session_id=1');
        const json = await res.json();
        const filtered = (json.data || []).filter(group =>
          group.sections.some(sec => sec.class_id === parseInt(formClass) && sec.section_id === parseInt(formSection))
        );
        setFormSubjectGroups(filtered);
      } catch (err) {
        showNotification('Failed to load form subject groups', 'danger');
      }
    }
    loadSubjectGroups();
  }, [formClass, formSection]);

  // Filter Panel Subjects
  useEffect(() => {
    if (!selectedSubjectGroup) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }
    const group = subjectGroups.find(g => g.id === parseInt(selectedSubjectGroup));
    setSubjects(group ? group.subjects : []);
  }, [selectedSubjectGroup, subjectGroups]);

  // Form Panel Subjects
  useEffect(() => {
    if (!formSubjectGroup) {
      setFormSubjects([]);
      setFormSubject('');
      return;
    }
    const group = formSubjectGroups.find(g => g.id === parseInt(formSubjectGroup));
    setFormSubjects(group ? group.subjects : []);
  }, [formSubjectGroup, formSubjectGroups]);

  // Auto-align form fields when filters change
  useEffect(() => {
    if (selectedClass) setFormClass(selectedClass);
    if (selectedSection) setFormSection(selectedSection);
    if (selectedSubjectGroup) setFormSubjectGroup(selectedSubjectGroup);
    if (selectedSubject) setFormSubject(selectedSubject);
  }, [selectedClass, selectedSection, selectedSubjectGroup, selectedSubject]);

  // Load lessons list
  const loadLessons = async () => {
    if (!selectedClass || !selectedSection || !selectedSubjectGroup || !selectedSubject) {
      showNotification('Please select all filters to search lessons', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson-plan/lessons?class_section_id=${selectedSection}&subject_group_subject_id=${selectedSubject}&session_id=1`);
      const json = await res.json();
      setLessons(json.data || []);
    } catch (err) {
      showNotification('Failed to load lessons list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!lessonName.trim()) {
      showNotification('Lesson Name is required', 'warning');
      return;
    }
    if (!formClass || !formSection || !formSubjectGroup || !formSubject) {
      showNotification('Please fill in all mapping fields in the form', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/lesson-plan/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lessonId,
          name: lessonName,
          class_section_id: parseInt(formSection),
          subject_group_subject_id: parseInt(formSubject),
          session_id: 1
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification(lessonId ? 'Lesson updated successfully' : 'Lesson created successfully', 'success');
        resetForm();
        if (selectedClass && selectedSection && selectedSubjectGroup && selectedSubject) {
          loadLessons();
        }
      } else {
        showNotification(json.message || 'Failed to save lesson', 'danger');
      }
    } catch (err) {
      showNotification('Error saving lesson', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lesson) => {
    setLessonId(lesson.id);
    setLessonName(lesson.name);
    setFormClass(selectedClass);
    setFormSection(selectedSection);
    setFormSubjectGroup(selectedSubjectGroup);
    setFormSubject(selectedSubject);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lesson? This will delete all mapped topics.')) return;
    try {
      const res = await fetch(`/api/lesson-plan/lessons/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Lesson deleted successfully', 'success');
        loadLessons();
      } else {
        showNotification(json.message || 'Failed to delete lesson', 'danger');
      }
    } catch (err) {
      showNotification('Error deleting lesson', 'danger');
    }
  };

  const resetForm = () => {
    setLessonId(null);
    setLessonName('');
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
          Lesson Management
        </h2>
        <p className="text-zinc-400 text-sm">
          Define core lesson units mapped to classes, sections, and subject syllabi
        </p>
      </div>

      {/* Filters */}
      <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
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
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
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
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value="">Select Group</option>
              {subjectGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedSubjectGroup}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.sgs_id} value={sub.sgs_id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadLessons}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Search size={14} /> Search Lessons
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Lesson list (2/3 width) */}
        <div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white">Lessons List</h3>
            <button
              onClick={loadLessons}
              disabled={loading || !selectedSubject}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
              Loading lessons...
            </div>
          ) : !selectedSubject ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              Select subject filters above and search to view lessons
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No lessons defined for this subject selection
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12">No.</th>
                    <th className="py-3.5 px-4">Lesson Name</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {lessons.map((lesson, idx) => (
                    <tr key={lesson.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-zinc-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{lesson.name}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="p-1.5 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Lesson Form (1/3 width) */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-semibold text-white">
                {lessonId ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              {lessonId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Lesson Name</label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="e.g. Unit 1: Introduction to Mechanics"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Scope Mappings</span>
              
              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Class</label>
                <select
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Section</label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  disabled={!formClass}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select Section</option>
                  {formSections.map(s => (
                    <option key={s.id} value={s.id}>{s.section}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Subject Group</label>
                <select
                  value={formSubjectGroup}
                  onChange={(e) => setFormSubjectGroup(e.target.value)}
                  disabled={!formSection}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select Group</option>
                  {formSubjectGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  disabled={!formSubjectGroup}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select Subject</option>
                  {formSubjects.map(sub => (
                    <option key={sub.sgs_id} value={sub.sgs_id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded text-xs font-semibold transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save size={14} /> {submitting ? 'Saving...' : 'Save Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
