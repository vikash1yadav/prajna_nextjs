'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, CheckCircle, Clock, AlertCircle, Percent } from 'lucide-react';

export default function ManageSyllabusStatusPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [loading, setLoading] = useState(false);
  const [syllabusStatus, setSyllabusStatus] = useState([]);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);
      } catch (err) {
        showNotification('Failed to load classes', 'danger');
      }
    }
    init();
  }, []);

  // Load sections
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

  // Load subject groups
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
        showNotification('Failed to load subject groups', 'danger');
      }
    }
    loadSubjectGroups();
  }, [selectedClass, selectedSection]);

  // Load subjects
  useEffect(() => {
    if (!selectedSubjectGroup) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }
    const group = subjectGroups.find(g => g.id === parseInt(selectedSubjectGroup));
    setSubjects(group ? group.subjects : []);
  }, [selectedSubjectGroup, subjectGroups]);

  // Search Syllabus Plan
  const handleSearch = async () => {
    if (!selectedClass || !selectedSection || !selectedSubjectGroup || !selectedSubject) {
      showNotification('Please select all filters to search', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lesson-plan/syllabus-status?class_section_id=${selectedSection}&subject_group_subject_id=${selectedSubject}&session_id=1`);
      const json = await res.json();
      setSyllabusStatus(json.data || []);
    } catch (err) {
      showNotification('Failed to load syllabus status details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStats = () => {
    let totalLessons = syllabusStatus.length;
    let totalTopics = 0;
    let completedTopics = 0;

    syllabusStatus.forEach(lesson => {
      totalTopics += lesson.topics.length;
      completedTopics += lesson.topics.filter(t => t.status === 1).length;
    });

    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      totalLessons,
      totalTopics,
      completedTopics,
      incompleteTopics: totalTopics - completedTopics,
      completionPercentage
    };
  };

  const stats = getStats();

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
          Syllabus Status
        </h2>
        <p className="text-zinc-400 text-sm">
          Monitor teaching progress and syllabus completion metrics
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
            onClick={handleSearch}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <Search size={14} /> View Progress
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
          Loading progress statistics...
        </div>
      ) : syllabusStatus.length > 0 ? (
        <div className="space-y-6">
          {/* Stats Cards Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Lessons Defined</span>
              <span className="text-2xl font-bold text-white mt-1">{stats.totalLessons}</span>
            </div>

            <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Topics Mapped</span>
              <span className="text-2xl font-bold text-white mt-1">{stats.totalTopics}</span>
            </div>

            <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl flex flex-col justify-between">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Completed Topics</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1">{stats.completedTopics}</span>
            </div>

            {/* Radial-style Progress Block */}
            <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl flex items-center justify-between">
              <div className="flex flex-col justify-between h-full">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Overall Progress</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1">{stats.completionPercentage}%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-zinc-800 flex items-center justify-center relative shrink-0">
                <Percent size={14} className="text-indigo-400" />
                <svg className="absolute inset-0 -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke="#4f46e5"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - stats.completionPercentage / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Syllabus Progress Linear Bar */}
          <div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-zinc-400 uppercase tracking-wider">Syllabus Coverage</span>
              <span className="text-white">{stats.completionPercentage}% Complete</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Detailed Syllabus List */}
          <div className="space-y-4">
            {syllabusStatus.map((lesson, index) => {
              const completed = lesson.topics.filter(t => t.status === 1).length;
              const percent = lesson.topics.length > 0 ? Math.round((completed / lesson.topics.length) * 100) : 0;

              return (
                <div key={lesson.lesson_id} className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
                  {/* Lesson Heading with percentage completed */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-900 w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 text-zinc-400 text-xs font-bold font-mono">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{lesson.lesson_name}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Topics Covered: {completed} / {lesson.topics.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-zinc-300">{percent}%</span>
                    </div>
                  </div>

                  {lesson.topics.length === 0 ? (
                    <p className="text-zinc-600 text-xs py-2 pl-11">No topics assigned to this lesson</p>
                  ) : (
                    <div className="space-y-2 pl-11">
                      {lesson.topics.map(topic => (
                        <div
                          key={topic.topic_id}
                          className="flex items-center justify-between p-3 bg-zinc-900/30 border border-white/5 rounded-lg text-xs hover:border-indigo-500/10 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            {topic.status === 1 ? (
                              <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                            ) : (
                              <Clock className="text-zinc-500 shrink-0" size={16} />
                            )}
                            <span className="font-medium text-white">{topic.topic_name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {topic.status === 1 ? (
                              <span className="px-2.5 py-0.5 bg-emerald-950/40 text-emerald-400 rounded-full text-[10px] border border-emerald-500/10 font-bold uppercase tracking-wider">
                                Complete
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[10px] border border-white/5 font-bold uppercase tracking-wider animate-pulse">
                                Incomplete
                              </span>
                            )}
                            {topic.complete_date && (
                              <span className="text-[10px] text-zinc-500 font-medium">Done: {topic.complete_date}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-zinc-500 text-sm bg-zinc-950/20 border border-white/5 rounded-xl text-center">
          Filter and search to display syllabus progress analytics dashboard
        </div>
      )}
    </div>
  );
}
