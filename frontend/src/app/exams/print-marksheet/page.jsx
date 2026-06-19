'use client';

import React, { useState, useEffect } from 'react';
import { Search, Printer, AlertCircle, X, Award, BarChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PrintMarksheetPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [grades, setGrades] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Ranks generation status
  const [rankingInProgress, setRankingInProgress] = useState(false);

  // Print Preview state
  const [printPreviewMode, setPrintPreviewMode] = useState(false);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadClasses();
    loadExamGroups();
    loadTemplates();
    loadGrades();
    loadDivisions();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const json = await res.json();
      setClasses(json.data || []);
    } catch (e) {
      console.error('Failed to load classes', e);
    }
  };

  const loadExamGroups = async () => {
    try {
      const res = await fetch('/api/exams/groups');
      const json = await res.json();
      setExamGroups(json.data || []);
    } catch (e) {
      console.error('Failed to load groups', e);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/exams/templates/marksheet');
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  };

  const loadGrades = async () => {
    try {
      const res = await fetch('/api/exams/grades');
      const json = await res.json();
      setGrades(json.data || []);
    } catch (e) {
      console.error('Failed to load grades', e);
    }
  };

  const loadDivisions = async () => {
    try {
      const res = await fetch('/api/exams/divisions');
      const json = await res.json();
      setDivisions(json.data || []);
    } catch (e) {
      console.error('Failed to load divisions', e);
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

  const handleGroupChange = async (val) => {
    setSelectedGroup(val);
    setSelectedExam('');
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

  const fetchStudents = async () => {
    if (!selectedExam || !selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      // Get students registered
      const res = await fetch(`/api/exams/exams/${selectedExam}/students?class_id=${selectedClass}&section_id=${selectedSection}`);
      const json = await res.json();
      const list = json.data || [];

      // Query subject results for each student to calculate their total scores
      const studentsWithResults = await Promise.all(list.map(async (student) => {
        const resultRes = await fetch(`/api/exams/exams/${selectedExam}/students/${student.exam_group_class_batch_exam_student_id}/results`);
        const resultJson = await resultRes.json();
        const results = resultJson.data || [];

        let grandTotalObtained = 0;
        let grandTotalMax = 0;
        let hasFailed = false;

        results.forEach(r => {
          const obtained = r.attendence === 'absent' ? 0 : parseFloat(r.get_marks || 0);
          const max = parseFloat(r.max_marks || 100);
          grandTotalObtained += obtained;
          grandTotalMax += max;
          if (obtained < parseFloat(r.min_marks || 33) || r.attendence === 'absent') {
            hasFailed = true;
          }
        });

        const percentage = grandTotalMax > 0 ? (grandTotalObtained / grandTotalMax) * 100 : 0;

        // Map division
        let divisionName = 'FAIL';
        if (!hasFailed) {
          const matchedDiv = divisions.find(d => percentage >= parseFloat(d.percentage_from) && percentage <= parseFloat(d.percentage_to));
          divisionName = matchedDiv ? matchedDiv.name : 'PASS';
        }

        return {
          ...student,
          results,
          grandTotalObtained,
          grandTotalMax,
          percentage,
          hasFailed,
          divisionName
        };
      }));

      setStudents(studentsWithResults);
      setSelectedStudentIds(studentsWithResults.map(s => s.exam_group_class_batch_exam_student_id));
    } catch (e) {
      showNotification('Failed to load student marksheets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSaveRanks = async () => {
    if (students.length === 0) return;
    setRankingInProgress(true);
    try {
      // Sort by grandTotalObtained descending
      const sorted = [...students].sort((a, b) => b.grandTotalObtained - a.grandTotalObtained);
      
      const ranksPayload = sorted.map((st, idx) => ({
        exam_group_class_batch_exam_student_id: st.exam_group_class_batch_exam_student_id,
        rank: idx + 1
      }));

      const res = await fetch('/api/exams/results/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ranks: ranksPayload, examGroupExamId: parseInt(selectedExam) })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Student ranks generated and saved successfully');
        fetchStudents();
      }
    } catch (e) {
      showNotification('Failed to compute ranks', 'error');
    } finally {
      setRankingInProgress(false);
    }
  };

  const toggleStudentSelection = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(x => x !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.exam_group_class_batch_exam_student_id));
    }
  };

  const triggerPrintPreview = () => {
    if (selectedStudentIds.length === 0) {
      showNotification('Please select at least one student', 'error');
      return;
    }
    if (!selectedTemplate) {
      showNotification('Please select a marksheet template', 'error');
      return;
    }
    const templateDetails = templates.find(t => String(t.id) === selectedTemplate);
    setSelectedTemplateDetails(templateDetails);
    setPrintPreviewMode(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className={printPreviewMode ? 'hidden' : 'block'}>
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Print Marksheets</h2>
          <p className="text-zinc-400 text-sm">Select class criteria and markssheet template to rank students and generate batch reports.</p>
        </div>

        {/* Filter Panel */}
        <div className="glass-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mt-6">
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
            <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedGroup}>
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
            <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Marksheet Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[42px] !px-3 !text-zinc-200">
                <SelectValue placeholder="Choose Design" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.template}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          {students.length > 0 && (
            <button 
              onClick={calculateAndSaveRanks}
              disabled={rankingInProgress}
              className="px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all"
            >
              <Award size={16} />
              {rankingInProgress ? 'Computing Ranks...' : 'Calculate & Save Ranks'}
            </button>
          )}
          <button 
            onClick={fetchStudents}
            disabled={!selectedExam || !selectedClass || !selectedSection || loading}
            className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 font-medium"
          >
            <Search size={16} /> Search Marks Ledger
          </button>
        </div>

        {/* Student list results */}
        <div className="glass-card mt-8 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Retrieving student scores...</div>
          ) : students.length > 0 ? (
            <div className="h-full flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart size={18} className="text-indigo-400" />
                  Marksheets Ledger
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-semibold">
                    Checked {selectedStudentIds.length} / {students.length}
                  </span>
                  <button 
                    onClick={toggleAllStudents}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="table-container !mt-0 !border-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>Select</th>
                      <th>Admission No</th>
                      <th>Exam Roll No</th>
                      <th>Student Name</th>
                      <th>Grand Total</th>
                      <th>Percentage</th>
                      <th>Rank</th>
                      <th>Result Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(st => (
                      <tr key={st.exam_group_class_batch_exam_student_id} className="cursor-pointer hover:bg-white/5" onClick={() => toggleStudentSelection(st.exam_group_class_batch_exam_student_id)}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedStudentIds.includes(st.exam_group_class_batch_exam_student_id)}
                            onChange={() => {}}
                            className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                        </td>
                        <td>{st.admission_no}</td>
                        <td>{st.exam_roll_no || st.roll_no || 'N/A'}</td>
                        <td className="font-semibold text-white">{st.firstname} {st.lastname}</td>
                        <td>{st.grandTotalObtained.toFixed(2)} / {st.grandTotalMax}</td>
                        <td>{st.percentage.toFixed(2)}%</td>
                        <td>
                          <span className="font-bold text-indigo-400">{st.rank ? `#${st.rank}` : '-'}</span>
                        </td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${st.hasFailed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {st.divisionName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-white/5 pt-4">
                <button 
                  onClick={triggerPrintPreview}
                  className="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 font-medium"
                >
                  <Printer size={16} /> Generate Marksheets
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
              <AlertCircle size={48} className="stroke-[1.2] text-zinc-600" />
              <span>Select parameters and search to load active marks summaries.</span>
            </div>
          )}
        </div>
      </div>

      {/* Print Preview Mode overlay */}
      {printPreviewMode && selectedTemplateDetails && (
        <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto p-8 flex flex-col gap-6 screen-only">
          <div className="flex justify-between items-center bg-zinc-900 border border-white/5 p-4 rounded-xl max-w-4xl mx-auto w-full no-print">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Print Preview Panel</span>
              <span className="text-sm font-semibold text-white">Template: {selectedTemplateDetails.template} &middot; Total Transcripts: {selectedStudentIds.length}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold text-sm transition-all"
              >
                Print PDF / Reports
              </button>
              <button 
                onClick={() => setPrintPreviewMode(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-semibold text-sm transition-all flex items-center gap-1.5"
              >
                <X size={16} /> Close Preview
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-10 items-center max-w-4xl mx-auto w-full pb-16 marksheet-print-container">
            {students
              .filter(s => selectedStudentIds.includes(s.exam_group_class_batch_exam_student_id))
              .map((student, idx) => (
                <div key={student.exam_group_class_batch_exam_student_id} className="bg-white text-black border-[3px] border-zinc-900 w-[750px] p-8 rounded-xl relative flex flex-col gap-5 page-break-after">
                  <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
                    {selectedTemplateDetails.left_logo && <img src={selectedTemplateDetails.left_logo} className="w-16 h-16 object-contain" />}
                    <div className="text-center flex-grow">
                      <h2 className="text-base font-bold uppercase tracking-tight">{selectedTemplateDetails.school_name || 'SCHOOL NAME'}</h2>
                      <p className="text-[10px] text-zinc-500 font-semibold">{selectedTemplateDetails.school_address || 'Address info'}</p>
                      <h3 className="text-xs font-semibold uppercase mt-1">{selectedTemplateDetails.heading || 'REPORT CARD'}</h3>
                    </div>
                    {selectedTemplateDetails.right_logo && <img src={selectedTemplateDetails.right_logo} className="w-16 h-16 object-contain" />}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-[11px] font-semibold text-zinc-700 border-b border-zinc-200 pb-3">
                    <div className="col-span-2 flex flex-col gap-2">
                      {selectedTemplateDetails.is_name === 1 && <div>Student Name: <span className="text-zinc-900 font-bold">{student.firstname} {student.lastname}</span></div>}
                      {selectedTemplateDetails.is_admission_no === 1 && <div>Admission No: <span className="text-zinc-900">{student.admission_no}</span></div>}
                      {selectedTemplateDetails.is_roll_no === 1 && <div>Exam Roll No: <span className="text-zinc-900">{student.exam_roll_no || student.roll_no || 'N/A'}</span></div>}
                      {selectedTemplateDetails.is_class === 1 && <div>Class: <span className="text-zinc-900">{student.class}</span></div>}
                      {selectedTemplateDetails.is_section === 1 && <div>Section: <span className="text-zinc-900">{student.section}</span></div>}
                      {selectedTemplateDetails.is_father_name === 1 && <div>Father Name: <span className="text-zinc-900">{student.father_name || 'N/A'}</span></div>}
                    </div>
                    {selectedTemplateDetails.is_photo === 1 && (
                      <div className="w-20 h-24 border border-zinc-400 flex items-center justify-center text-[10px] text-zinc-400 bg-zinc-50 ml-auto rounded overflow-hidden">
                        {student.image ? (
                          <img src={`/uploads/students/${student.image}`} className="w-full h-full object-cover" />
                        ) : 'Student Photo'}
                      </div>
                    )}
                  </div>

                  {/* Marks breakdown */}
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-300">
                        <th className="p-2 font-bold">Subject</th>
                        <th className="p-2 font-bold text-center">Max Marks</th>
                        <th className="p-2 font-bold text-center">Min Marks</th>
                        <th className="p-2 font-bold text-center">Marks Obtained</th>
                        <th className="p-2 font-bold text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.results.map((res, i) => {
                        const obtainedVal = res.attendence === 'absent' ? 0 : parseFloat(res.get_marks || 0);
                        const isPass = obtainedVal >= parseFloat(res.min_marks || 33) && res.attendence !== 'absent';
                        return (
                          <tr key={i} className="border-b border-zinc-200">
                            <td className="p-2 font-semibold text-zinc-900">{res.subject_name}</td>
                            <td className="p-2 text-center">{res.max_marks}</td>
                            <td className="p-2 text-center">{res.min_marks}</td>
                            <td className="p-2 text-center font-bold text-zinc-900">
                              {res.attendence === 'absent' ? 'ABS' : obtainedVal.toFixed(2)}
                            </td>
                            <td className={`p-2 text-right font-semibold ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {res.attendence === 'absent' ? 'Absent' : isPass ? 'Pass' : 'Fail'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {selectedTemplateDetails.is_division === 1 && (
                    <div className="text-[11px] font-bold text-zinc-900 mt-2 bg-zinc-50 border border-zinc-200 p-3 rounded flex justify-between">
                      <span>Grand Total: {student.grandTotalObtained.toFixed(2)} / {student.grandTotalMax}</span>
                      <span>Percentage: {student.percentage.toFixed(2)}%</span>
                      <span>Class Rank: {student.rank ? `#${student.rank}` : 'N/A'}</span>
                      <span className={student.hasFailed ? 'text-rose-600' : 'text-emerald-600'}>
                        Result: {student.divisionName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-end mt-6 pt-3 border-t border-dashed border-zinc-200">
                    <div className="text-[9px] text-zinc-500 font-medium">Generated via PrajnaERP</div>
                    {selectedTemplateDetails.sign && (
                      <div className="text-center flex flex-col items-center gap-1">
                        <img src={selectedTemplateDetails.sign} className="w-20 h-8 object-contain" />
                        <span className="text-[8px] font-bold border-t border-zinc-300 pt-1 text-zinc-700 uppercase">Authorized Signature</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
