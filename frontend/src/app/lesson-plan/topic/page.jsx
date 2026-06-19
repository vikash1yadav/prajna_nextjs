'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Layers, Search, RefreshCw } from 'lucide-react';

export default function TopicPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]); // Lessons matching filters for list view
  const [formLessons, setFormLessons] = useState([]); // Lessons matching form selectors

  // Filter selections
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(''); // Stores lesson_id to load topics

  // Topic list data
  const [topics, setTopics] = useState([]);

  // Form states
  const [topicId, setTopicId] = useState(null);
  const [topicName, setTopicName] = useState('');

  // Active form selectors (can differ from filter panel if needed, but defaults to filters)
  const [formClass, setFormClass] = useState('');
  const [formSection, setFormSection] = useState('');
  const [formSections, setFormSections] = useState([]);
  const [formSubjectGroups, setFormSubjectGroups] = useState([]);
  const [formSubjectGroup, setFormSubjectGroup] = useState('');
  const [formSubjects, setFormSubjects] = useState([]);
  const [formSubject, setFormSubject] = useState('');
  const [formLesson, setFormLesson] = useState('');

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

  // Filter Panel Lessons
  useEffect(() => {
    if (!selectedSection || !selectedSubject) {
      setLessons([]);
      setSelectedLesson('');
      return;
    }
    async function loadLessons() {
      try {
        const res = await fetch(`/api/lesson-plan/lessons?class_section_id=${selectedSection}&subject_group_subject_id=${selectedSubject}&session_id=1`);
        const json = await res.json();
        setLessons(json.data || []);
      } catch (err) {
        showNotification('Failed to load filter lessons', 'danger');
      }
    }
    loadLessons();
  }, [selectedSection, selectedSubject]);

  // Form Panel Lessons
  useEffect(() => {
    if (!formSection || !formSubject) {
      setFormLessons([]);
      setFormLesson('');
      return;
    }
    async function loadLessons() {
      try {
        const res = await fetch(`/api/lesson-plan/lessons?class_section_id=${formSection}&subject_group_subject_id=${formSubject}&session_id=1`);
        const json = await res.json();
        setFormLessons(json.data || []);
      } catch (err) {
        showNotification('Failed to load form lessons', 'danger');
      }
    }
    loadLessons();
  }, [formSection, formSubject]);

  // Auto-align form fields when filters change
  useEffect(() => {
    if (selectedClass) setFormClass(selectedClass);
    if (selectedSection) setFormSection(selectedSection);
    if (selectedSubjectGroup) setFormSubjectGroup(selectedSubjectGroup);
    if (selectedSubject) setFormSubject(selectedSubject);
    if (selectedLesson) setFormLesson(selectedLesson);
  }, [selectedClass, selectedSection, selectedSubjectGroup, selectedSubject, selectedLesson]);

  // Load topics list
  const loadTopics = async () => {
    if (!selectedLesson) {
      showNotification('Please select a lesson to load topics', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson-plan/topics?lesson_id=${selectedLesson}&session_id=1`);
      const json = await res.json();
      setTopics(json.data || []);
    } catch (err) {
      showNotification('Failed to load topics list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search whenever selectedLesson updates
  useEffect(() => {
    if (selectedLesson) {
      loadTopics();
    } else {
      setTopics([]);
    }
  }, [selectedLesson]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!topicName.trim()) {
      showNotification('Topic Name is required', 'warning');
      return;
    }
    if (!formLesson) {
      showNotification('Please select a Lesson mapping in the form', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/lesson-plan/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: topicId,
          name: topicName,
          lesson_id: parseInt(formLesson),
          session_id: 1,
          status: 0 // default incomplete
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification(topicId ? 'Topic updated successfully' : 'Topic created successfully', 'success');
        resetForm();
        if (selectedLesson) {
          loadTopics();
        }
      } else {
        showNotification(json.message || 'Failed to save topic', 'danger');
      }
    } catch (err) {
      showNotification('Error saving topic', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (topic) => {
    setTopicId(topic.id);
    setTopicName(topic.name);
    setFormClass(selectedClass);
    setFormSection(selectedSection);
    setFormSubjectGroup(selectedSubjectGroup);
    setFormSubject(selectedSubject);
    setFormLesson(selectedLesson);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/lesson-plan/topics/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Topic deleted successfully', 'success');
        loadTopics();
      } else {
        showNotification(json.message || 'Failed to delete topic', 'danger');
      }
    } catch (err) {
      showNotification('Error deleting topic', 'danger');
    }
  };

  const resetForm = () => {
    setTopicId(null);
    setTopicName('');
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
          Topic Management
        </h2>
        <p className="text-zinc-400 text-sm">
          Define core lecture topics nested inside syllabus lessons
        </p>
      </div>

      {/* Filters */}
      <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Lesson</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            disabled={!selectedSubject}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
          >
            <option value="">Select Lesson</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Topic list (2/3 width) */}
        <div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white">Topics List</h3>
            <button
              onClick={loadTopics}
              disabled={loading || !selectedLesson}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
              Loading topics...
            </div>
          ) : !selectedLesson ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              Select class, subject, and a lesson above to view topics list
            </div>
          ) : topics.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No topics registered under this lesson
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12">No.</th>
                    <th className="py-3.5 px-4">Topic Name</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {topics.map((topic, idx) => (
                    <tr key={topic.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-zinc-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{topic.name}</td>
                      <td className="py-3.5 px-4">
                        {topic.status === 1 ? (
                          <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 rounded text-[10px] uppercase font-bold tracking-wider">
                            Complete
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-white/5 rounded text-[10px] uppercase font-bold tracking-wider">
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(topic)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(topic.id)}
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

        {/* Right Topic Form (1/3 width) */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-semibold text-white">
                {topicId ? 'Edit Topic' : 'Create Topic'}
              </h3>
              {topicId && (
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
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Topic Name</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Newton's First Law"
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

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Lesson</label>
                <select
                  value={formLesson}
                  onChange={(e) => setFormLesson(e.target.value)}
                  disabled={!formSubject}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select Lesson</option>
                  {formLessons.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
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
                <Save size={14} /> {submitting ? 'Saving...' : 'Save Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
