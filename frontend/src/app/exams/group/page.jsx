'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, BookOpen, UserPlus, Settings, Calendar, Save, X, Search, Check, ListChecks 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExamGroupPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for Exam Group
  const [groupForm, setGroupForm] = useState({ id: null, name: '', exam_type: 'gpa', description: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Modals / Detail states
  const [activeGroup, setActiveGroup] = useState(null); // Group for connected exams
  const [exams, setExams] = useState([]);
  const [examForm, setExamForm] = useState({ id: null, exam: '', passing_percentage: '', session_id: '21', is_publish: 0, description: '' });
  const [showExamForm, setShowExamForm] = useState(false);

  // Subject Mapping modal state
  const [activeExamForSubjects, setActiveExamForSubjects] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]); // all available subjects
  const [examSubjects, setExamSubjects] = useState([]); // current mapping
  
  // Student Enrolment modal state
  const [activeExamForStudents, setActiveExamForStudents] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentsList, setStudentsList] = useState([]); // eligible students list
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadGroups();
    loadSubjects();
    loadClasses();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams/groups');
      const json = await res.json();
      setGroups(json.data || []);
    } catch (e) {
      showNotification('Failed to load exam groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      const json = await res.json();
      setSubjectsList(json.data || []);
    } catch (e) {
      console.error('Failed to load subjects', e);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const json = await res.json();
      setClasses(json.data || []);
    } catch (e) {
      console.error('Failed to load classes', e);
    }
  };

  const loadSections = async (classId) => {
    if (!classId) return;
    try {
      const res = await fetch(`/api/classes/sections?class_id=${classId}`);
      const json = await res.json();
      setSections(json.data || []);
    } catch (e) {
      console.error('Failed to load sections', e);
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/exams/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });
      const json = await res.json();
      if (json.success) {
        showNotification(groupForm.id ? 'Exam group updated successfully' : 'Exam group created successfully');
        setGroupForm({ id: null, name: '', exam_type: 'gpa', description: '' });
        loadGroups();
      } else {
        showNotification(json.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showNotification('Server error', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGroupDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group? All connected exams and marks will be permanently lost.')) return;
    try {
      const res = await fetch(`/api/exams/groups/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification('Exam group deleted');
        loadGroups();
        if (activeGroup?.id === id) setActiveGroup(null);
      }
    } catch (e) {
      showNotification('Delete failed', 'error');
    }
  };

  // Connected Exams logic
  const openExamsModal = async (group) => {
    setActiveGroup(group);
    try {
      const res = await fetch(`/api/exams/groups/${group.id}/exams`);
      const json = await res.json();
      setExams(json.data || []);
      setExamForm({ id: null, exam: '', passing_percentage: '', session_id: '21', is_publish: 0, description: '', exam_group_id: group.id });
      setShowExamForm(false);
    } catch (e) {
      showNotification('Failed to fetch exams for group', 'error');
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    if (!examForm.exam.trim()) return;
    try {
      const res = await fetch('/api/exams/groups/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm)
      });
      const json = await res.json();
      if (json.success) {
        showNotification(examForm.id ? 'Exam updated' : 'Exam added');
        openExamsModal(activeGroup);
      }
    } catch (err) {
      showNotification('Failed to save exam', 'error');
    }
  };

  const handleExamDelete = async (id) => {
    if (!confirm('Remove this exam?')) return;
    try {
      const res = await fetch(`/api/exams/groups/exams/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification('Exam removed');
        openExamsModal(activeGroup);
      }
    } catch (e) {
      showNotification('Remove failed', 'error');
    }
  };

  // Connected Subjects logic
  const openSubjectsModal = async (exam) => {
    setActiveExamForSubjects(exam);
    try {
      const res = await fetch(`/api/exams/exams/${exam.id}/subjects`);
      const json = await res.json();
      const currentMapping = json.data || [];
      
      // Initialize layout with current mappings, or blank
      setExamSubjects(currentMapping.map(m => ({
        subject_id: m.subject_id,
        date_from: m.date_from || '',
        time_from: m.time_from || '',
        duration: m.duration || '1.5 hrs',
        room_no: m.room_no || '',
        max_marks: m.max_marks || 100,
        min_marks: m.min_marks || 33,
        credit_hours: m.credit_hours || 0
      })));
    } catch (e) {
      showNotification('Failed to load exam subjects', 'error');
    }
  };

  const addSubjectRow = () => {
    setExamSubjects([...examSubjects, { subject_id: '', date_from: '', time_from: '', duration: '1.5 hrs', room_no: '', max_marks: 100, min_marks: 33, credit_hours: 0 }]);
  };

  const removeSubjectRow = (idx) => {
    setExamSubjects(examSubjects.filter((_, i) => i !== idx));
  };

  const updateSubjectRow = (idx, field, val) => {
    const next = [...examSubjects];
    next[idx][field] = val;
    setExamSubjects(next);
  };

  const saveSubjectMapping = async () => {
    // Validate
    const invalid = examSubjects.some(s => !s.subject_id || !s.date_from || !s.time_from);
    if (invalid) {
      showNotification('Please fill all Subject, Date, and Start Time values', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/exams/exams/${activeExamForSubjects.id}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: examSubjects })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Exam subjects scheduled successfully');
        setActiveExamForSubjects(null);
        openExamsModal(activeGroup);
      }
    } catch (e) {
      showNotification('Failed to save mapping', 'error');
    }
  };

  // Student Assignment logic
  const openStudentsModal = async (exam) => {
    setActiveExamForStudents(exam);
    setSelectedClass('');
    setSelectedSection('');
    setStudentsList([]);
    setSelectedStudentIds([]);
  };

  const fetchEligibleStudents = async () => {
    if (!selectedClass || !selectedSection) return;
    try {
      const res = await fetch(`/api/exams/exams/${activeExamForStudents.id}/eligible-students?exam_group_id=${activeGroup.id}&class_id=${selectedClass}&section_id=${selectedSection}`);
      const json = await res.json();
      const list = json.data || [];
      setStudentsList(list);
      
      // Auto-check students who are already enrolled in this exam
      const checkedIds = list
        .filter(s => s.exam_group_class_batch_exam_student_id !== null)
        .map(s => s.student_session_id);
      setSelectedStudentIds(checkedIds);
    } catch (e) {
      showNotification('Failed to load eligible students', 'error');
    }
  };

  const toggleStudentCheck = (studentSessionId) => {
    if (selectedStudentIds.includes(studentSessionId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentSessionId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentSessionId]);
    }
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === studentsList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(studentsList.map(s => s.student_session_id));
    }
  };

  const saveStudentAssignment = async () => {
    const payload = studentsList
      .filter(s => selectedStudentIds.includes(s.student_session_id))
      .map(s => ({
        student_id: s.student_id,
        student_session_id: s.student_session_id,
        roll_no: s.roll_no
      }));

    try {
      const res = await fetch(`/api/exams/exams/${activeExamForStudents.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: payload })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Students assigned to exam successfully');
        setActiveExamForStudents(null);
      }
    } catch (e) {
      showNotification('Assignment failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Exam Group Management</h2>
        <p className="text-zinc-400 text-sm">Manage academic terms, connect exams, configure subject schedules, and assign students.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form: Add / Edit Group */}
        <div className="glass-card h-fit flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            {groupForm.id ? 'Edit Exam Group' : 'Add Exam Group'}
          </h3>

          <form onSubmit={handleGroupSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Group Name</label>
              <input 
                type="text"
                placeholder="e.g. Term 1 Examinations"
                className="input-field w-full"
                value={groupForm.name}
                onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Exam Type</label>
              <Select
                value={groupForm.exam_type}
                onValueChange={(val) => setGroupForm({ ...groupForm, exam_type: val })}
              >
                <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpa">GPA Grading System</SelectItem>
                  <SelectItem value="average">Average Passing Scale</SelectItem>
                  <SelectItem value="basic">Basic / Marks Grading System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Description</label>
              <textarea 
                placeholder="Add brief details about the exam group..."
                rows={4}
                className="input-field w-full py-3 h-auto"
                value={groupForm.description}
                onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                type="submit" 
                disabled={formSubmitting}
                className="flex-grow btn-primary flex items-center justify-center gap-2 font-medium"
              >
                <Save size={16} />
                {groupForm.id ? 'Update Group' : 'Save Group'}
              </button>
              {groupForm.id && (
                <button 
                  type="button" 
                  onClick={() => setGroupForm({ id: null, name: '', exam_type: 'gpa', description: '' })}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right List: Groups */}
        <div className="glass-card xl:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white">Exam Groups Ledger</h3>
          
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading exam groups...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
              <BookOpen size={48} className="stroke-[1.2] text-zinc-600" />
              <span>No exam groups registered yet. Add one from the left panel.</span>
            </div>
          ) : (
            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Group Details</th>
                    <th>Exam Type</th>
                    <th>Exams Connected</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id}>
                      <td>
                        <span className="font-semibold text-white block">{g.name}</span>
                        <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{g.description || 'No description added'}</span>
                      </td>
                      <td>
                        <span className="capitalize px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {g.exam_type}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-white pl-4">{g.counter || 0}</span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openExamsModal(g)}
                            className="px-3 py-1.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-500/25 transition-all"
                          >
                            <Settings size={13} />
                            Exams
                          </button>
                          <button 
                            onClick={() => setGroupForm({ id: g.id, name: g.name, exam_type: g.exam_type, description: g.description })}
                            className="p-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleGroupDelete(g.id)}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
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
      </div>

      {/* MODAL 1: Connected Exams */}
      {activeGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 !p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{activeGroup.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Exams connected within this academic term</p>
              </div>
              <button 
                onClick={() => setActiveGroup(null)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Connected Exams List</span>
              <button 
                onClick={() => {
                  setExamForm({ id: null, exam: '', passing_percentage: '', session_id: '21', is_publish: 0, description: '', exam_group_id: activeGroup.id });
                  setShowExamForm(true);
                }}
                className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Connect New Exam
              </button>
            </div>

            {/* Exam Add/Edit Form Overlay */}
            {showExamForm && (
              <form onSubmit={handleExamSubmit} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-white">{examForm.id ? 'Edit Exam' : 'Connect Exam'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Exam Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mid Term" 
                      className="input-field w-full !h-[40px]"
                      value={examForm.exam}
                      onChange={e => setExamForm({ ...examForm, exam: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Min Passing Percentage (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 35" 
                      className="input-field w-full !h-[40px]"
                      value={examForm.passing_percentage}
                      onChange={e => setExamForm({ ...examForm, passing_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Publish Status</label>
                    <Select
                      value={String(examForm.is_publish)}
                      onValueChange={(val) => setExamForm({ ...examForm, is_publish: parseInt(val) })}
                    >
                      <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[40px] !px-4 !text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Unpublished</SelectItem>
                        <SelectItem value="1">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Session</label>
                    <Select
                      value={String(examForm.session_id)}
                      onValueChange={(val) => setExamForm({ ...examForm, session_id: val })}
                    >
                      <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[40px] !px-4 !text-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="21">2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Description</label>
                  <input 
                    type="text" 
                    placeholder="Short description or instructions..." 
                    className="input-field w-full !h-[40px]"
                    value={examForm.description}
                    onChange={e => setExamForm({ ...examForm, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button type="submit" className="btn-primary py-2 px-4 text-xs font-semibold">Save Exam</button>
                  <button 
                    type="button" 
                    onClick={() => setShowExamForm(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {exams.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No exams connected yet.</div>
            ) : (
              <div className="table-container !mt-0 !border-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Passing %</th>
                      <th>Publish Status</th>
                      <th>Subjects Scheduled</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(ex => (
                      <tr key={ex.id}>
                        <td className="font-semibold text-white">{ex.exam}</td>
                        <td>{ex.passing_percentage ? `${ex.passing_percentage}%` : 'N/A'}</td>
                        <td>
                          {ex.is_publish === 1 ? (
                            <span className="badge-success px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Published</span>
                          ) : (
                            <span className="badge-danger px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">Unpublished</span>
                          )}
                        </td>
                        <td>
                          <span className="font-bold text-white pl-4">{ex.total_subjects || 0}</span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openSubjectsModal(ex)}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Calendar size={12} /> Subjects
                            </button>
                            <button 
                              onClick={() => openStudentsModal(ex)}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-purple-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <UserPlus size={12} /> Assign Students
                            </button>
                            <button 
                              onClick={() => {
                                setExamForm({ id: ex.id, exam: ex.exam, passing_percentage: ex.passing_percentage || '', session_id: String(ex.session_id), is_publish: ex.is_publish, description: ex.description || '', exam_group_id: activeGroup.id });
                                setShowExamForm(true);
                              }}
                              className="p-1.5 bg-white/5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                            >
                              <Edit size={13} />
                            </button>
                            <button 
                              onClick={() => handleExamDelete(ex.id)}
                              className="p-1.5 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
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
        </div>
      )}

      {/* MODAL 2: Mapped Subjects */}
      {activeExamForSubjects && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 !p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Subjects</h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Exam: {activeExamForSubjects.exam}</p>
              </div>
              <button 
                onClick={() => setActiveExamForSubjects(null)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scheduled Subjects Timetable</span>
              <button 
                onClick={addSubjectRow}
                className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Subject
              </button>
            </div>

            {examSubjects.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No subjects scheduled for this exam yet. Add a row to get started.</div>
            ) : (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table min-w-[800px]">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Subject *</th>
                      <th style={{ width: '15%' }}>Date *</th>
                      <th style={{ width: '15%' }}>Start Time *</th>
                      <th style={{ width: '10%' }}>Duration</th>
                      <th style={{ width: '10%' }}>Room No</th>
                      <th style={{ width: '10%' }}>Max Marks</th>
                      <th style={{ width: '10%' }}>Min Marks</th>
                      <th style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {examSubjects.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <select 
                            className="input-field w-full !h-[38px] !bg-zinc-900"
                            value={row.subject_id}
                            onChange={e => updateSubjectRow(idx, 'subject_id', parseInt(e.target.value))}
                          >
                            <option value="">Select Subject</option>
                            {subjectsList.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input 
                            type="date" 
                            className="input-field w-full !h-[38px] !bg-zinc-900 !px-2"
                            value={row.date_from}
                            onChange={e => updateSubjectRow(idx, 'date_from', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="time" 
                            className="input-field w-full !h-[38px] !bg-zinc-900 !px-2"
                            value={row.time_from}
                            onChange={e => updateSubjectRow(idx, 'time_from', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            placeholder="Duration"
                            className="input-field w-full !h-[38px] !bg-zinc-900"
                            value={row.duration}
                            onChange={e => updateSubjectRow(idx, 'duration', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            placeholder="Room"
                            className="input-field w-full !h-[38px] !bg-zinc-900"
                            value={row.room_no}
                            onChange={e => updateSubjectRow(idx, 'room_no', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="input-field w-full !h-[38px] !bg-zinc-900"
                            value={row.max_marks}
                            onChange={e => updateSubjectRow(idx, 'max_marks', parseFloat(e.target.value))}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="input-field w-full !h-[38px] !bg-zinc-900"
                            value={row.min_marks}
                            onChange={e => updateSubjectRow(idx, 'min_marks', parseFloat(e.target.value))}
                          />
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => removeSubjectRow(idx)}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t border-white/5 pt-4 mt-2">
              <button 
                onClick={saveSubjectMapping}
                className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 font-medium"
              >
                <Save size={16} /> Save Timetable
              </button>
              <button 
                onClick={() => setActiveExamForSubjects(null)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Assign Students */}
      {activeExamForStudents && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 !p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Assign Students</h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">Exam: {activeExamForStudents.exam}</p>
              </div>
              <button 
                onClick={() => setActiveExamForStudents(null)} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Class</label>
                <Select
                  value={selectedClass}
                  onValueChange={(val) => {
                    setSelectedClass(val);
                    setSelectedSection('');
                    setSections([]);
                    loadSections(val);
                  }}
                >
                  <SelectTrigger className="w-full !bg-zinc-900 !border-white/5 !h-[40px] !px-4">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.class}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Section</label>
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                  disabled={!selectedClass}
                >
                  <SelectTrigger className="w-full !bg-zinc-900 !border-white/5 !h-[40px] !px-4">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button 
                onClick={fetchEligibleStudents}
                disabled={!selectedClass || !selectedSection}
                className="btn-primary py-2.5 h-[40px] flex items-center justify-center gap-2 font-medium"
              >
                <Search size={16} /> Search Students
              </button>
            </div>

            {studentsList.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-zinc-400 font-semibold">
                    Eligible Students ({studentsList.length}) &middot; Selected ({selectedStudentIds.length})
                  </span>
                  <button 
                    onClick={toggleAllStudents}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {selectedStudentIds.length === studentsList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="table-container !mt-0 !border-none max-h-[300px] overflow-y-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '8%' }}>Select</th>
                        <th>Admission No</th>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Father Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map(st => (
                        <tr key={st.student_session_id} className="cursor-pointer hover:bg-white/5" onClick={() => toggleStudentCheck(st.student_session_id)}>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.includes(st.student_session_id)}
                              onChange={() => {}} // toggles via row click
                              className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                          </td>
                          <td>{st.admission_no}</td>
                          <td>{st.roll_no || 'N/A'}</td>
                          <td className="font-semibold text-white">{st.firstname} {st.lastname}</td>
                          <td>{st.father_name || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
                  <button 
                    onClick={saveStudentAssignment}
                    className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 font-medium"
                  >
                    <ListChecks size={16} /> Save Assignments
                  </button>
                  <button 
                    onClick={() => setActiveExamForStudents(null)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 shadow-2xl min-w-[300px] ${toast.type === 'error' ? 'border-l-rose-500' : 'border-l-indigo-500'}`}>
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
