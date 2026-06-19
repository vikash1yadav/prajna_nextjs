'use client';

import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle, Edit, CheckSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExamResultPage() {
  const [examGroups, setExamGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [students, setStudents] = useState([]);
  const [subjectMaxMarks, setSubjectMaxMarks] = useState(100);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadExamGroups();
    loadClasses();
  }, []);

  const loadExamGroups = async () => {
    try {
      const res = await fetch('/api/exams/groups');
      const json = await res.json();
      setExamGroups(json.data || []);
    } catch (e) {
      showNotification('Failed to load exam groups', 'error');
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

  const handleGroupChange = async (val) => {
    setSelectedGroup(val);
    setSelectedExam('');
    setSelectedSubject('');
    setExamSubjects([]);
    setStudents([]);
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

  const handleExamChange = async (val) => {
    setSelectedExam(val);
    setSelectedSubject('');
    setStudents([]);
    if (!val) {
      setExamSubjects([]);
      return;
    }
    try {
      const res = await fetch(`/api/exams/exams/${val}/subjects`);
      const json = await res.json();
      setExamSubjects(json.data || []);
    } catch (e) {
      showNotification('Failed to load exam subjects', 'error');
    }
  };

  const handleClassChange = async (val) => {
    setSelectedClass(val);
    setSelectedSection('');
    setSections([]);
    setStudents([]);
    if (!val) return;
    try {
      const res = await fetch(`/api/classes/sections?class_id=${val}`);
      const json = await res.json();
      setSections(json.data || []);
    } catch (e) {
      console.error('Failed to load sections', e);
    }
  };

  const fetchResults = async () => {
    if (!selectedSubject || !selectedClass || !selectedSection) return;
    setLoading(true);

    // Get selected subject max marks
    const activeSub = examSubjects.find(s => String(s.id) === selectedSubject);
    setSubjectMaxMarks(activeSub ? activeSub.max_marks : 100);

    try {
      const res = await fetch(`/api/exams/subjects/${selectedSubject}/results?class_id=${selectedClass}&section_id=${selectedSection}`);
      const json = await res.json();
      const list = json.data || [];
      
      // Map database row parameters to frontend marks entry
      setStudents(list.map(s => ({
        exam_group_class_batch_exam_student_id: s.exam_group_class_batch_exam_student_id,
        admission_no: s.admission_no,
        roll_no: s.exam_roll_no || s.roll_no || 'N/A',
        name: `${s.firstname} ${s.lastname}`,
        attendence: s.attendence || 'present', // present or absent
        get_marks: s.get_marks || '0.00',
        note: s.note || ''
      })));
    } catch (e) {
      showNotification('Failed to load marks matrix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (idx, val) => {
    const next = [...students];
    next[idx].get_marks = val;
    setStudents(next);
  };

  const handleAttendanceChange = (idx, val) => {
    const next = [...students];
    next[idx].attendence = val;
    if (val === 'absent') {
      next[idx].get_marks = '0.00';
    }
    setStudents(next);
  };

  const handleNoteChange = (idx, val) => {
    const next = [...students];
    next[idx].note = val;
    setStudents(next);
  };

  const saveResults = async () => {
    // Validate marks do not exceed max marks
    for (const st of students) {
      if (st.attendence === 'present') {
        const val = parseFloat(st.get_marks);
        if (isNaN(val) || val < 0 || val > subjectMaxMarks) {
          showNotification(`Invalid marks for ${st.name}. Must be between 0 and ${subjectMaxMarks}`, 'error');
          return;
        }
      }
    }

    setSaving(true);
    const payload = students.map(s => ({
      exam_group_class_batch_exam_student_id: s.exam_group_class_batch_exam_student_id,
      exam_group_class_batch_exam_subject_id: parseInt(selectedSubject),
      attendence: s.attendence,
      get_marks: s.attendence === 'absent' ? '0.00' : parseFloat(s.get_marks).toFixed(2),
      note: s.note
    }));

    try {
      const res = await fetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: payload })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Examination results saved successfully');
        fetchResults();
      }
    } catch (e) {
      showNotification('Failed to save results', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Marks Register (Entry)</h2>
        <p className="text-zinc-400 text-sm">Select exam parameters to search, enter, and record marks for student subject exams.</p>
      </div>

      {/* Parameters Panel */}
      <div className="glass-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Exam Group</label>
          <Select value={selectedGroup} onValueChange={handleGroupChange}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
              <SelectValue placeholder="Select Group" />
            </SelectTrigger>
            <SelectContent>
              {examGroups.map(g => (
                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Exam</label>
          <Select value={selectedExam} onValueChange={handleExamChange} disabled={!selectedGroup}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.exam}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Class</label>
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
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
          <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={examSubjects.length === 0}>
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {examSubjects.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.subject_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={fetchResults}
          disabled={!selectedSubject || !selectedClass || !selectedSection || loading}
          className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 font-medium"
        >
          <Search size={16} /> Search Marks Register
        </button>
      </div>

      {/* Students Marks Entry Panel */}
      <div className="glass-card min-h-[350px] flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Querying marks database...</div>
        ) : students.length > 0 ? (
          <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-indigo-400" />
                Student Marks Ledger
              </h3>
              <span className="text-xs font-semibold px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10">
                Max Marks: {subjectMaxMarks}
              </span>
            </div>

            <div className="table-container !mt-0 !border-none overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Admission No</th>
                    <th style={{ width: '15%' }}>Exam Roll No</th>
                    <th style={{ width: '25%' }}>Student Name</th>
                    <th style={{ width: '20%' }}>Attendance Status</th>
                    <th style={{ width: '15%' }}>Marks Obtained</th>
                    <th style={{ width: '20%' }}>Teacher Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => (
                    <tr key={st.exam_group_class_batch_exam_student_id}>
                      <td>{st.admission_no}</td>
                      <td>{st.roll_no}</td>
                      <td className="font-semibold text-white">{st.name}</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAttendanceChange(idx, 'present')}
                            className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${st.attendence === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-transparent text-zinc-500 border-white/5 hover:text-white'}`}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => handleAttendanceChange(idx, 'absent')}
                            className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${st.attendence === 'absent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' : 'bg-transparent text-zinc-500 border-white/5 hover:text-white'}`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number"
                          step="0.01"
                          disabled={st.attendence === 'absent'}
                          value={st.get_marks}
                          placeholder="Marks"
                          onChange={e => handleMarksChange(idx, e.target.value)}
                          className="input-field w-full !h-[36px] !px-2.5 font-bold text-center !bg-zinc-900 disabled:opacity-30"
                        />
                      </td>
                      <td>
                        <input 
                          type="text"
                          placeholder="e.g. Excellent"
                          value={st.note}
                          onChange={e => handleNoteChange(idx, e.target.value)}
                          className="input-field w-full !h-[36px] !px-2.5 !bg-zinc-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4 border-t border-white/5 pt-4">
              <button 
                onClick={saveResults}
                disabled={saving}
                className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 font-medium"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
            <AlertCircle size={48} className="stroke-[1.2] text-zinc-600" />
            <span>No student marks register active. Please select filters and click Search.</span>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 shadow-2xl min-w-[300px] ${toast.type === 'error' ? 'border-l-rose-500' : 'border-l-indigo-500'}`}>
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
