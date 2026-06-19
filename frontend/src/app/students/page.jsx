'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Search, User, Filter, X, Edit, Trash2, Plus, Calendar, BookOpen, CreditCard, Home } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

import StudentForm, { defaultFormValues } from '@/components/students/StudentForm';

export default function StudentsPage() {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [queryUrl, setQueryUrl] = useState('/api/students');

  // SWR Data Fetching
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  const { data: sectionsData } = useSWR(selectedClass ? `/api/classes/${selectedClass}/sections` : null, fetcher);
  const sections = sectionsData?.data || [];

  const { data: studentsData, isLoading: loadingStudents, mutate: mutateStudents } = useSWR(queryUrl, fetcher);
  const students = studentsData?.data || [];
  const loading = loadingStudents;

  // Dialog State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formValues, setFormValues] = useState(defaultFormValues);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    let url = '/api/students?';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (selectedClass) params.push(`class_id=${selectedClass}`);
    if (selectedSection) params.push(`section_id=${selectedSection}`);
    
    setQueryUrl(url + params.join('&'));
  };

  const handleOpenAdd = () => {
    setFormValues(defaultFormValues);
    setFormMode('add');
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (student) => {
    try {
      const res = await fetch(`/api/students/${student.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setFormValues({
          ...defaultFormValues,
          ...json.data,
          class_id: json.data.class_id || '',
          section_id: json.data.section_id || ''
        });
      } else {
        // Fallback to table row data
        setFormValues({
          ...defaultFormValues,
          ...student
        });
      }
      setFormMode('edit');
      setIsFormOpen(true);
    } catch (err) {
      console.error('Failed to fetch student details for edit', err);
    }
  };

  const handleOpenView = async (student) => {
    try {
      const res = await fetch(`/api/students/${student.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedStudent(json.data);
      } else {
        setSelectedStudent(student);
      }
      setIsViewOpen(true);
    } catch (err) {
      console.error('Failed to load profile', err);
      setSelectedStudent(student);
      setIsViewOpen(true);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert('Student deleted successfully!');
        // Refresh list
        mutateStudents();
      } else {
        alert('Failed to delete student: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Error connecting to backend API');
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Students Registry</h2>
          <p className="text-zinc-400 text-sm">Search, filter, and view detailed profiles of active student accounts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add New Student
        </button>
      </div>

      {/* Search Bar & Filters Form */}
      <form onSubmit={handleSearch} className="glass-card flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow min-w-[240px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, roll no, admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="min-w-[150px]">
          <Select
            value={selectedClass || "all"}
            onValueChange={(val) => {
              setSelectedClass(val === "all" ? "" : val);
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <Select
            value={selectedSection || "all"}
            onValueChange={(val) => setSelectedSection(val === "all" ? "" : val)}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button type="submit" className="btn btn-primary h-[48px]">
          <Filter size={16} /> Filter
        </button>
      </form>

      {/* Students List Table */}
      <div className="glass-card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">Loading students list...</div>
        ) : students.length > 0 ? (
          <div className="table-container !mt-0 !border-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Mobile</th>
                  <th>Guardian</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td><span className="font-mono text-purple-400 font-semibold">{st.admission_no}</span></td>
                    <td>{st.roll_no || 'N/A'}</td>
                    <td className="font-medium text-white">
                      {`${st.firstname || ''} ${st.middlename || ''} ${st.lastname || ''}`.trim()}
                    </td>
                    <td>{st.class}</td>
                    <td>{st.section}</td>
                    <td>{st.mobileno || 'N/A'}</td>
                    <td>{st.guardian_name || 'N/A'}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary !px-2.5 !py-1 !text-xs flex items-center gap-1"
                          onClick={() => handleOpenView(st)}
                        >
                          <User size={12} /> View
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary !px-2.5 !py-1 !text-xs flex items-center gap-1 !text-indigo-400 hover:!text-indigo-300"
                          onClick={() => handleOpenEdit(st)}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary !px-2.5 !py-1 !text-xs flex items-center gap-1 !text-rose-400 hover:!text-rose-300"
                          onClick={() => handleDeleteStudent(st.id)}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400">No student records match the filters.</div>
        )}
      </div>

      {/* Modal Profile Viewer */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[650px] bg-zinc-950/95 border-zinc-800 backdrop-blur-xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <User size={22} className="text-indigo-400" /> Student Profile Detail
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="flex flex-col gap-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Full Name</span>
                  <p className="text-base font-semibold mt-1 text-white">
                    {`${selectedStudent.firstname || ''} ${selectedStudent.middlename || ''} ${selectedStudent.lastname || ''}`.trim()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Admission Number</span>
                  <p className="text-base font-semibold mt-1 text-purple-400 font-mono">{selectedStudent.admission_no}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Gender</span>
                  <p className="text-sm mt-1 text-zinc-300">{selectedStudent.gender || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Date of Birth</span>
                  <p className="text-sm mt-1 text-zinc-300">{selectedStudent.dob || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-zinc-800 pb-6">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Father Name</span>
                  <p className="text-sm mt-1 text-zinc-300">{selectedStudent.father_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Guardian Detail</span>
                  <p className="text-sm mt-1 text-zinc-300">{selectedStudent.guardian_name} ({selectedStudent.guardian_relation || 'Guardian'})</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Guardian Phone</span>
                  <p className="text-sm mt-1 text-zinc-300">{selectedStudent.guardian_phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">National ID (Adhar / Samagra)</span>
                  <p className="text-sm mt-1 text-zinc-300">Adhar: {selectedStudent.adhar_no || 'N/A'} / Samagra: {selectedStudent.samagra_id || 'N/A'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Bank Account Credentials</span>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium">Bank Name</span>
                    <p className="text-sm text-zinc-300 mt-0.5">{selectedStudent.bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium">Account No</span>
                    <p className="text-sm font-mono text-zinc-300 mt-0.5">{selectedStudent.bank_account_no || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium">IFSC Code</span>
                    <p className="text-sm font-mono text-zinc-300 mt-0.5">{selectedStudent.ifsc_code || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => setIsViewOpen(false)}>Close Profile</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Student Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[800px] bg-zinc-950/95 border-zinc-800 backdrop-blur-xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {formMode === 'add' ? <Plus className="text-indigo-400" /> : <Edit className="text-indigo-400" />}
              {formMode === 'add' ? 'Enroll New Student' : 'Modify Student Profile'}
            </DialogTitle>
          </DialogHeader>

          <StudentForm
            mode="modal"
            formMode={formMode}
            initialData={formValues}
            onSuccess={() => {
              setIsFormOpen(false);
              mutateStudents();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
