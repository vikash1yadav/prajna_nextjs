'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, Plus, BookOpen, Trash2, Calendar, FileText, X } from 'lucide-react';

export default function ManageLessonPlanPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Filter selections
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(''); // Stores sgs_id

  // Data states
  const [syllabusStatus, setSyllabusStatus] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTopicForLogs, setSelectedTopicForLogs] = useState(null);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLogsViewModal, setShowLogsViewModal] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null); // Topic for new syllabus log

  // Form states for Daily Syllabus Log (subject_syllabus)
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeFrom, setTimeFrom] = useState('09:00 AM');
  const [timeTo, setTimeTo] = useState('10:00 AM');
  const [presentation, setPresentation] = useState('');
  const [attachment, setAttachment] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [video, setVideo] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [teachingMethod, setTeachingMethod] = useState('');
  const [objectives, setObjectives] = useState('');
  const [prevKnowledge, setPrevKnowledge] = useState('');
  const [compQuestions, setCompQuestions] = useState('');
  const [createdFor, setCreatedFor] = useState('');
  const [logStatus, setLogStatus] = useState('1'); // 1 = Complete, 0 = Incomplete

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

        const staffRes = await fetch('/api/staff?role_id=2');
        const staffJson = await staffRes.json();
        setStaffList(staffJson.data || []);
        if (staffJson.data && staffJson.data.length > 0) {
          setCreatedFor(staffJson.data[0].id.toString());
        }
      } catch (err) {
        showNotification('Failed to initialize page filters', 'danger');
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
      showNotification('Failed to load lesson plan status', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Topic Status (Mark Complete / Incomplete)
  const handleToggleTopic = async (topic, currentStatus) => {
    if (currentStatus === 0) {
      // Mark as complete: prompt for Syllabus Log details
      setActiveTopic(topic);
      setShowLogModal(true);
    } else {
      // Mark as incomplete: simple update and removal of completed log
      if (!confirm('Are you sure you want to mark this topic as incomplete?')) return;
      try {
        const res = await fetch('/api/lesson-plan/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: topic.topic_id,
            name: topic.topic_name,
            lesson_id: syllabusStatus.find(l => l.topics.some(t => t.topic_id === topic.topic_id)).lesson_id,
            status: 0,
            complete_date: null,
            session_id: 1
          })
        });
        const json = await res.json();
        if (json.success) {
          showNotification('Topic status updated to Incomplete', 'success');
          handleSearch();
        }
      } catch (err) {
        showNotification('Error updating topic status', 'danger');
      }
    }
  };

  // Save Daily Syllabus Log
  const handleSaveSyllabusLog = async (e) => {
    e.preventDefault();
    if (!presentation.trim()) {
      showNotification('Presentation field is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit Syllabus Log
      const logRes = await fetch('/api/lesson-plan/syllabus-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: activeTopic.topic_id,
          session_id: 1,
          created_by: 1, // logged in staff id default
          created_for: parseInt(createdFor),
          date: logDate,
          time_from: timeFrom,
          time_to: timeTo,
          presentation,
          attachment,
          lacture_youtube_url: youtubeUrl,
          lacture_video: video,
          sub_topic: subTopic,
          teaching_method: teachingMethod,
          general_objectives: objectives,
          previous_knowledge: prevKnowledge,
          comprehensive_questions: compQuestions,
          status: parseInt(logStatus)
        })
      });
      const logJson = await logRes.json();

      if (!logJson.success) {
        throw new Error(logJson.message || 'Failed to save daily log');
      }

      // 2. Update Topic Status to 1 (Complete) with complete_date
      const topicRes = await fetch('/api/lesson-plan/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeTopic.topic_id,
          name: activeTopic.topic_name,
          lesson_id: syllabusStatus.find(l => l.topics.some(t => t.topic_id === activeTopic.topic_id)).lesson_id,
          status: 1,
          complete_date: logDate,
          session_id: 1
        })
      });
      const topicJson = await topicRes.json();

      if (topicJson.success) {
        showNotification('Topic marked as completed and log saved', 'success');
        setShowLogModal(false);
        resetForm();
        handleSearch();
      } else {
        throw new Error(topicJson.message || 'Failed to update topic status');
      }
    } catch (err) {
      showNotification(err.message || 'Error processing syllabus log', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // View Logs
  const handleViewLogs = async (topic) => {
    setSelectedTopicForLogs(topic);
    try {
      const res = await fetch(`/api/lesson-plan/syllabus-logs?topic_id=${topic.topic_id}&session_id=1`);
      const json = await res.json();
      setLogs(json.data || []);
      setShowLogsViewModal(true);
    } catch (err) {
      showNotification('Failed to fetch syllabus logs', 'danger');
    }
  };

  // Delete log
  const handleDeleteLog = async (logId) => {
    if (!confirm('Are you sure you want to delete this syllabus log?')) return;
    try {
      const res = await fetch(`/api/lesson-plan/syllabus-logs/${logId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Syllabus log deleted successfully', 'success');
        // Refresh logs list
        handleViewLogs(selectedTopicForLogs);
      }
    } catch (err) {
      showNotification('Error deleting log', 'danger');
    }
  };

  const resetForm = () => {
    setActiveTopic(null);
    setLogDate(new Date().toISOString().split('T')[0]);
    setTimeFrom('09:00 AM');
    setTimeTo('10:00 AM');
    setPresentation('');
    setAttachment('');
    setYoutubeUrl('');
    setVideo('');
    setSubTopic('');
    setTeachingMethod('');
    setObjectives('');
    setPrevKnowledge('');
    setCompQuestions('');
    setLogStatus('1');
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
          Manage Lesson Plan
        </h2>
        <p className="text-zinc-400 text-sm">
          Track syllabus progress, toggle topic completion, and log daily lecture details
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
            <Search size={14} /> Search Syllabus
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
          Loading lessons plan...
        </div>
      ) : syllabusStatus.length > 0 ? (
        /* LESSONS PLAN LIST */
        <div className="space-y-4">
          {syllabusStatus.map(lesson => (
            <div key={lesson.lesson_id} className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="text-indigo-400" size={18} />
                  <h3 className="text-sm font-semibold text-white">{lesson.lesson_name}</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {lesson.topics.length} Topics
                </span>
              </div>

              {lesson.topics.length === 0 ? (
                <p className="text-zinc-600 text-xs py-2 pl-7">No topics registered for this lesson</p>
              ) : (
                <div className="space-y-2.5 pl-7">
                  {lesson.topics.map(topic => (
                    <div
                      key={topic.topic_id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-lg hover:border-indigo-500/20 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTopic(topic, topic.status)}
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          {topic.status === 1 ? (
                            <CheckCircle2 className="text-emerald-500" size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <div>
                          <span className="text-xs font-medium text-white block">{topic.topic_name}</span>
                          {topic.complete_date && (
                            <span className="text-[10px] text-zinc-500">Completed on: {topic.complete_date}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        <button
                          onClick={() => handleViewLogs(topic)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded border border-white/5 text-[11px] font-semibold transition-all"
                        >
                          <FileText size={12} /> Syllabus Logs
                        </button>
                        {topic.status === 0 && (
                          <button
                            onClick={() => {
                              setActiveTopic(topic);
                              setShowLogModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-900/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded border border-indigo-500/10 text-[11px] font-semibold transition-all"
                          >
                            <Plus size={12} /> Add Log
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-zinc-500 text-sm bg-zinc-950/20 border border-white/5 rounded-xl text-center">
          Filter and search to load syllabus completion plan
        </div>
      )}

      {/* DAILY SYLLABUS LOG SUBMISSION MODAL */}
      {showLogModal && activeTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 w-full max-w-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Record Daily Syllabus Log</h3>
                <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
                  Topic: {activeTopic.topic_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLogModal(false);
                  resetForm();
                }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSyllabusLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Time From</label>
                  <input
                    type="text"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Time To</label>
                  <input
                    type="text"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Created For (Teacher)</label>
                  <select
                    value={createdFor}
                    onChange={(e) => setCreatedFor(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    {staffList.map(st => (
                      <option key={st.id} value={st.id}>{`${st.name} ${st.surname || ''}`.trim()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Topic Status</label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="1">Complete (Default)</option>
                    <option value="0">Incomplete / In-progress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Presentation Description</label>
                <textarea
                  value={presentation}
                  onChange={(e) => setPresentation(e.target.value)}
                  placeholder="Slides, board work, worksheets..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Sub Topic</label>
                  <input
                    type="text"
                    value={subTopic}
                    onChange={(e) => setSubTopic(e.target.value)}
                    placeholder="Specific sub-sections..."
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Teaching Method</label>
                  <input
                    type="text"
                    value={teachingMethod}
                    onChange={(e) => setTeachingMethod(e.target.value)}
                    placeholder="Interactive, Board..."
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Lecture Youtube Link</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">General Objectives</label>
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Understand basic properties..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Previous Knowledge</label>
                  <textarea
                    value={prevKnowledge}
                    onChange={(e) => setPrevKnowledge(e.target.value)}
                    placeholder="Students already know..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Comprehensive Questions</label>
                <textarea
                  value={compQuestions}
                  onChange={(e) => setCompQuestions(e.target.value)}
                  placeholder="Questions asked during lecture..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Save size={14} /> {submitting ? 'Submitting...' : 'Save Syllabus Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DAILY SYLLABUS LOGS MODAL */}
      {showLogsViewModal && selectedTopicForLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-xl p-6 w-full max-w-3xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Daily Syllabus Logs</h3>
                <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
                  Topic: {selectedTopicForLogs.topic_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLogsViewModal(false);
                  setSelectedTopicForLogs(null);
                  setLogs([]);
                }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="text-center text-zinc-500 text-xs py-8">No syllabus logs documented for this topic.</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {logs.map((log, idx) => (
                  <div key={log.id} className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg space-y-3 relative group hover:border-indigo-500/10 transition-all">
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="absolute top-4 right-4 p-1.5 bg-rose-950/40 hover:bg-rose-500 text-rose-300 hover:text-white rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-2 text-[11px] text-zinc-400 gap-2">
                      <span className="font-semibold text-indigo-300">Log Entry #{logs.length - idx}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {log.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {log.time_from} - {log.time_to}</span>
                        <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">By: {log.staff_name || 'Admin'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Presentation Details</span>
                        <p className="text-zinc-300 bg-zinc-950/40 p-2 rounded border border-white/5">{log.presentation}</p>
                      </div>

                      {log.sub_topic && (
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Sub Topic</span>
                          <p className="text-zinc-300 bg-zinc-950/40 p-2 rounded border border-white/5">{log.sub_topic}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {log.teaching_method && (
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Method</span>
                          <span className="text-zinc-400 block">{log.teaching_method}</span>
                        </div>
                      )}
                      {log.general_objectives && (
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Objectives</span>
                          <span className="text-zinc-400 block">{log.general_objectives}</span>
                        </div>
                      )}
                      {log.comprehensive_questions && (
                        <div>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Questions Asked</span>
                          <span className="text-zinc-400 block">{log.comprehensive_questions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
