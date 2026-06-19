'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Search, Filter, Eye, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function DisabledStudentsPage() {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [queryUrl, setQueryUrl] = useState('/api/students?is_active=no');

  // SWR Data Fetching
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  const { data: sectionsData } = useSWR(selectedClass ? `/api/classes/${selectedClass}/sections` : null, fetcher);
  const sections = sectionsData?.data || [];

  const { data: studentsData, isLoading } = useSWR(queryUrl, fetcher);
  const students = studentsData?.data || [];

  // Dialog State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    let url = '/api/students?is_active=no';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (selectedClass) params.push(`class_id=${selectedClass}`);
    if (selectedSection) params.push(`section_id=${selectedSection}`);
    
    if (params.length > 0) {
      url += '&' + params.join('&');
    }
    setQueryUrl(url);
  };

  const handleOpenView = async (student) => {
    try {
      const res = await fetch(`/api/students/${student.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedStudent({ ...json.data, disable_reason_text: student.disable_reason_text });
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-rose-500 flex items-center gap-2">
            <AlertCircle size={28} /> Disabled Students
          </h2>
          <p className="text-zinc-400 text-sm">Review accounts of students who have been deactivated or removed.</p>
        </div>
      </div>

      {/* Search Bar & Filters Form */}
      <form onSubmit={handleSearch} className="glass-card flex flex-wrap gap-4 items-center border-rose-500/10">
        <div className="relative flex-grow min-w-[240px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search disabled students..."
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

        <button type="submit" className="btn btn-primary h-[48px] bg-rose-600 hover:bg-rose-500 shadow-rose-600/20">
          <Filter size={16} /> Filter
        </button>
      </form>

      {/* Students List Table */}
      <div className="glass-card !p-0 overflow-hidden border-rose-500/10">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">Loading disabled students list...</div>
        ) : students.length > 0 ? (
          <div className="table-container !mt-0 !border-none overflow-x-auto">
            <table className="data-table whitespace-nowrap">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Student Name</th>
                  <th>Class/Sec</th>
                  <th>Father Name</th>
                  <th>Disable Reason</th>
                  <th>Gender</th>
                  <th>Mobile</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="opacity-80 hover:opacity-100">
                    <td className="font-mono text-zinc-300">{student.admission_no}</td>
                    <td className="font-medium text-rose-400">
                      {[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}
                    </td>
                    <td>
                      {student.class ? `${student.class} (${student.section || '-'})` : '-'}
                    </td>
                    <td>{student.father_name || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {student.disable_reason_text || 'Unspecified'}
                        </span>
                        {student.dis_note && (
                          <span className="text-xs text-zinc-500 truncate max-w-[150px]" title={student.dis_note}>
                            - {student.dis_note}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{student.gender || '-'}</td>
                    <td>{student.mobileno || '-'}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenView(student)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400">
            No disabled students found matching your criteria.
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] border-rose-500/20">
          <DialogHeader>
            <DialogTitle className="text-rose-500 flex items-center gap-2">
              <AlertCircle size={20} /> Disabled Student Details
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="mt-4 flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold text-xl border border-rose-500/20">
                  {selectedStudent.firstname?.charAt(0) || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {[selectedStudent.firstname, selectedStudent.middlename, selectedStudent.lastname].filter(Boolean).join(' ')}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Admission No: <span className="text-white">{selectedStudent.admission_no}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">Class & Section</div>
                  <div className="text-sm text-white">
                    {selectedStudent.class ? `${selectedStudent.class} (${selectedStudent.section || '-'})` : '-'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">Father's Name</div>
                  <div className="text-sm text-white">{selectedStudent.father_name || '-'}</div>
                </div>
                <div className="bg-rose-500/10 rounded-lg p-3 border border-rose-500/20">
                  <div className="text-xs text-rose-400 mb-1">Disable Reason</div>
                  <div className="text-sm text-white font-medium">{selectedStudent.disable_reason_text || 'Unspecified'}</div>
                </div>
                <div className="bg-rose-500/10 rounded-lg p-3 border border-rose-500/20">
                  <div className="text-xs text-rose-400 mb-1">Disabled Date</div>
                  <div className="text-sm text-white">{selectedStudent.disable_at || '-'}</div>
                </div>
              </div>

              {selectedStudent.dis_note && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-2">Disable Note</div>
                  <div className="text-sm text-zinc-300 italic">"{selectedStudent.dis_note}"</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
