'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Filter, Plus, Trash2, Save, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const ClassSectionRow = ({ session, index, classes, onChange, onRemove }) => {
  const { data: sectionsData } = useSWR(session.class_id ? `/api/classes/${session.class_id}/sections` : null, fetcher);
  const sections = sectionsData?.data || [];

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 group">
      <div className="flex-1 min-w-[120px]">
        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">Class</label>
        <Select
          value={session.class_id ? String(session.class_id) : undefined}
          onValueChange={(val) => onChange(index, 'class_id', val || '')}
        >
          <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-9 !px-3 !text-sm !text-zinc-200 !rounded-lg flex justify-between items-center">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.class}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 min-w-[120px]">
        <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-semibold">Section</label>
        <Select
          value={session.section_id ? String(session.section_id) : undefined}
          onValueChange={(val) => onChange(index, 'section_id', val || '')}
          disabled={!session.class_id}
        >
          <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-9 !px-3 !text-sm !text-zinc-200 !rounded-lg flex justify-between items-center">
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map(s => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-10 flex justify-center mt-5">
        <button 
          onClick={() => onRemove(index)}
          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded opacity-50 hover:opacity-100 transition-all"
          title="Remove Assignment"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const MultiClassStudentCard = ({ student, classes }) => {
  const [sessions, setSessions] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize from student data
  useEffect(() => {
    if (student.student_sessions) {
      setSessions(student.student_sessions.map(s => ({
        id: s.id || Math.random().toString(), // temporary id for UI keys if new
        class_id: s.class_id || '',
        section_id: s.section_id || ''
      })));
    } else {
      setSessions([]);
    }
  }, [student]);

  const handleAddSession = () => {
    setSessions([...sessions, { id: Math.random().toString(), class_id: '', section_id: '' }]);
  };

  const handleRemoveSession = (index) => {
    const newSessions = [...sessions];
    newSessions.splice(index, 1);
    setSessions(newSessions);
  };

  const handleChange = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index][field] = value;
    if (field === 'class_id') {
      newSessions[index].section_id = ''; // reset section when class changes
    }
    setSessions(newSessions);
  };

  const handleUpdate = async () => {
    // Validate
    const validSessions = sessions.filter(s => s.class_id && s.section_id);
    if (validSessions.length === 0) {
      if (!confirm('This will remove all class assignments for this student. Are you sure?')) {
        return;
      }
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/students/${student.id}/multi-class`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: validSessions })
      });
      const json = await res.json();
      if (json.success) {
        alert('Multi-class sessions updated successfully!');
      } else {
        alert('Error: ' + json.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update sessions');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card flex flex-col gap-4 border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
      <div className="flex justify-between items-start pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/20">
            {student.firstname?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}
            </h3>
            <p className="text-zinc-400 text-sm">
              Admission No: <span className="text-white">{student.admission_no}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 h-9 px-4 text-xs flex items-center gap-2"
        >
          {isUpdating ? <span className="animate-spin text-lg block">⍥</span> : <Save size={14} />}
          Update
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-sm font-medium text-zinc-300">Enrolled Classes</h4>
          <button 
            onClick={handleAddSession}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded transition-colors"
          >
            <Plus size={14} /> Add Class
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center p-4 bg-black/20 rounded-lg text-zinc-500 text-sm">
            No active class assignments
          </div>
        ) : (
          sessions.map((session, index) => (
            <ClassSectionRow 
              key={session.id} 
              session={session} 
              index={index} 
              classes={classes} 
              onChange={handleChange} 
              onRemove={handleRemoveSession} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function MultiClassStudentPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [queryUrl, setQueryUrl] = useState('');

  // Fetch all classes
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  // Fetch sections for the top filter
  const { data: filterSectionsData } = useSWR(selectedClass ? `/api/classes/${selectedClass}/sections` : null, fetcher);
  const filterSections = filterSectionsData?.data || [];

  const { data: studentsData, isLoading } = useSWR(queryUrl || null, fetcher);
  const students = studentsData?.data || [];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection) {
      alert('Please select both a class and a section to search.');
      return;
    }
    setQueryUrl(`/api/students/multi-class?class_id=${selectedClass}&section_id=${selectedSection}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-400 flex items-center gap-2">
            <Layers size={28} /> Multi Class Student
          </h2>
          <p className="text-zinc-400 text-sm">Assign students to multiple class and section combinations simultaneously.</p>
        </div>
      </div>

      {/* Search Bar & Filters Form */}
      <form onSubmit={handleSearch} className="glass-card flex flex-wrap gap-4 items-center border-indigo-500/10">
        <div className="min-w-[200px] flex-1">
          <label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-semibold pl-1">Target Class</label>
          <Select
            value={selectedClass ? String(selectedClass) : ""}
            onValueChange={(val) => {
              setSelectedClass(val);
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
          <label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1.5 font-semibold pl-1">Target Section</label>
          <Select
            value={selectedSection ? String(selectedSection) : ""}
            onValueChange={(val) => setSelectedSection(val)}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Select Section..." />
            </SelectTrigger>
            <SelectContent>
              {filterSections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn btn-primary h-[48px] bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 px-8">
            <Search size={16} /> Search Students
          </button>
        </div>
      </form>

      {/* Results Area */}
      {queryUrl && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white mb-2">Search Results</h3>
          
          {isLoading ? (
            <div className="p-12 text-center text-zinc-400 animate-pulse glass-card border-indigo-500/10">
              Fetching student assignments...
            </div>
          ) : students.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {students.map(student => (
                <MultiClassStudentCard 
                  key={student.id} 
                  student={student} 
                  classes={classes} 
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-400 glass-card border-indigo-500/10">
              No students found in the selected class and section.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
