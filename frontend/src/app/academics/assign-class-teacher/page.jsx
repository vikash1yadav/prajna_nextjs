'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Users, RefreshCw } from 'lucide-react';

export default function AssignClassTeacherPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load initial data
  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academics/class-teachers?session_id=1');
      const json = await res.json();
      setAssignments(json.data || []);
    } catch (err) {
      showNotification('Failed to load assignments list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const staffRes = await fetch('/api/staff');
        const staffJson = await staffRes.json();
        setStaffList(staffJson.data || []);

        loadAssignments();
      } catch (err) {
        showNotification('Failed to load classes and staff', 'danger');
      }
    }
    init();
  }, []);

  // Load sections when class changes
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

  const handleTeacherCheckboxChange = (staffId) => {
    setSelectedStaffIds(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) {
      showNotification('Class and Section are required', 'warning');
      return;
    }
    if (selectedStaffIds.length === 0) {
      showNotification('Please select at least one teacher', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/class-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass,
          section_id: selectedSection,
          staff_ids: selectedStaffIds,
          session_id: 1
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification('Class teacher assignment saved successfully', 'success');
        resetForm();
        loadAssignments();
      } else {
        showNotification(json.message || 'Failed to save assignments', 'danger');
      }
    } catch (err) {
      showNotification('Error saving assignments', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedClass(assignment.class_id.toString());
    setSelectedStaffIds(assignment.teachers.map(t => t.staff_id));
    // Wait for class state update section trigger or load manually
    // Let's set selected section immediately (the sections list will load via useEffect)
    setSelectedSection(assignment.section_id.toString());
  };

  const handleDelete = async (classId, sectionId) => {
    if (!confirm('Are you sure you want to remove all class teachers assigned to this class section?')) return;
    
    try {
      const res = await fetch('/api/academics/class-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          section_id: sectionId,
          staff_ids: [],
          session_id: 1
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Assignments deleted successfully', 'success');
        loadAssignments();
      } else {
        showNotification(json.message || 'Failed to delete assignments', 'danger');
      }
    } catch (err) {
      showNotification('Error deleting assignments', 'danger');
    }
  };

  const resetForm = () => {
    setSelectedClass('');
    setSelectedSection('');
    setSelectedStaffIds([]);
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
          Assign Class Teacher
        </h2>
        <p className="text-zinc-400 text-sm">
          Map academic classes and sections to their respective class teachers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left assignments list table (2/3 width) */}
        <div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white">Class Teachers List</h3>
            <button
              onClick={loadAssignments}
              disabled={loading}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No class teachers assigned yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Section</th>
                    <th className="py-3.5 px-4">Class Teachers</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assignments.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors text-zinc-300">
                      <td className="py-3.5 px-4 font-medium text-white">{item.class_name}</td>
                      <td className="py-3.5 px-4">{item.section_name}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.teachers.map((teacher, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs border border-white/5"
                            >
                              {teacher.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.class_id, item.section_id)}
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

        {/* Right assign form (1/3 width) */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-base font-semibold text-white border-b border-white/5 pb-3">
              Assign Class Teacher
            </h3>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
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
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Teachers
              </label>
              <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 max-h-[220px] overflow-y-auto space-y-2.5">
                {staffList.length === 0 ? (
                  <p className="text-zinc-600 text-xs py-2">No staff registered</p>
                ) : (
                  staffList.map(st => (
                    <label key={st.id} className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedStaffIds.includes(st.id)}
                        onChange={() => handleTeacherCheckboxChange(st.id)}
                        className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span>{`${st.name} ${st.surname || ''} (${st.employee_id || 'N/A'})`}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-semibold transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save size={14} /> {submitting ? 'Saving...' : 'Save Mappings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
