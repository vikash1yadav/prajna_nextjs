'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Trash2, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function BulkDeletePage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [queryUrl, setQueryUrl] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch classes
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  // Fetch sections for class
  const { data: sectionsData } = useSWR(selectedClass ? `/api/classes/${selectedClass}/sections` : null, fetcher);
  const sections = sectionsData?.data || [];

  // Fetch students
  const { data: studentsData, isLoading, mutate } = useSWR(queryUrl || null, fetcher);
  const students = studentsData?.data || [];

  // Reset selection when students list changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [students]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) {
      alert('Please select both a class and a section to search.');
      return;
    }
    setQueryUrl(`/api/students?class_id=${selectedClass}&section_id=${selectedSection}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((st) => st.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((item) => item !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to delete.');
      return;
    }

    const confirmMessage = `Are you sure you want to permanently delete the ${selectedStudents.length} selected student record(s)?\n\nThis will also delete their login details, student session references, custom field values, and orphaned parent user records. This action CANNOT be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/students/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: selectedStudents }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message || 'Selected students deleted successfully!');
        setSelectedStudents([]);
        mutate();
      } else {
        alert('Failed to delete students: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-rose-500 flex items-center gap-2">
            <Trash2 size={28} /> Bulk Delete
          </h2>
          <p className="text-zinc-400 text-sm">Select and permanently remove multiple student records from the database.</p>
        </div>
      </div>

      {/* Filter Form */}
      <form onSubmit={handleSearch} className="glass-card flex flex-wrap gap-4 items-center border-rose-500/10">
        <div className="min-w-[200px] flex-1">
          <label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-semibold pl-1">Class</label>
          <Select
            value={selectedClass ? String(selectedClass) : undefined}
            onValueChange={(val) => {
              setSelectedClass(val || '');
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Select Class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-semibold pl-1">Section</label>
          <Select
            value={selectedSection ? String(selectedSection) : undefined}
            onValueChange={(val) => setSelectedSection(val || '')}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Select Section..." />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn btn-primary h-[48px] bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 px-8">
            <Search size={16} /> Search Students
          </button>
        </div>
      </form>

      {/* Results Area */}
      {queryUrl && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-4 px-1">
            <h3 className="text-lg font-semibold text-white">Student Records</h3>
            {students.length > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleting || selectedStudents.length === 0}
                className="btn btn-primary bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 h-10 px-6 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="animate-spin text-lg block">⍥</span>
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Selected ({selectedStudents.length})
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-zinc-400 animate-pulse glass-card border-rose-500/10">
              Fetching students list...
            </div>
          ) : students.length > 0 ? (
            <div className="glass-card !p-0 overflow-hidden border-rose-500/10">
              <div className="table-container !mt-0 !border-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500/20 w-4 h-4 cursor-pointer"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Admission No</th>
                      <th>Student Name</th>
                      <th>Class (Section)</th>
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      return (
                        <tr key={student.id} className={isSelected ? 'bg-rose-500/5' : ''}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500/20 w-4 h-4 cursor-pointer"
                              checked={isSelected}
                              onChange={() => handleSelectStudent(student.id)}
                            />
                          </td>
                          <td>
                            <span className="font-mono text-rose-400 font-semibold">{student.admission_no}</span>
                          </td>
                          <td className="font-medium text-white">
                            {[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}
                          </td>
                          <td>{student.class} ({student.section})</td>
                          <td>{student.dob && student.dob !== '0000-00-00' ? student.dob : 'N/A'}</td>
                          <td className="capitalize">{student.gender || 'N/A'}</td>
                          <td>{student.mobileno || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-400 glass-card border-rose-500/10 flex flex-col items-center gap-3">
              <Users size={48} className="text-zinc-600" />
              <p>No students found in the selected class and section.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
