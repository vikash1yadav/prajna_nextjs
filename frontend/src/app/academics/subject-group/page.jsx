'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, BookOpen, Layers, RefreshCw } from 'lucide-react';

export default function SubjectGroupPage() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Physics', code: 'PHY101', type: 'Theory' },
    { id: 2, name: 'Chemistry', code: 'CHM101', type: 'Theory' },
    { id: 3, name: 'Mathematics', code: 'MATH101', type: 'Theory' }
  ]);
  const [classes, setClasses] = useState([]);
  const [classSectionMappings, setClassSectionMappings] = useState([]); // List of all class-section pairs
  const [subjectGroups, setSubjectGroups] = useState([]);

  // Form states
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedClassSectionIds, setSelectedClassSectionIds] = useState([]); // Array of class_section_ids

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load subject groups
  const loadSubjectGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academics/subject-groups?session_id=1');
      const json = await res.json();
      setSubjectGroups(json.data || []);
    } catch (err) {
      showNotification('Failed to load subject groups', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Initialize page
  useEffect(() => {
    async function init() {
      try {
        // Load subjects
        const subjectsRes = await fetch('/api/subjects');
        const subjectsJson = await subjectsRes.json();
        if (subjectsJson.data && subjectsJson.data.length > 0) {
          setSubjects(subjectsJson.data);
        }

        // Load classes and their sections to construct classSectionMappings
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        const classesList = classesJson.data || [];
        setClasses(classesList);

        const mappings = [];
        for (const cls of classesList) {
          try {
            const sectionsRes = await fetch(`/api/classes/${cls.id}/sections`);
            const sectionsJson = await sectionsRes.json();
            const sectionsList = sectionsJson.data || [];
            sectionsList.forEach(sec => {
              mappings.push({
                class_section_id: sec.id, // primary key of class_sections mapping table
                class_id: cls.id,
                class_name: cls.class,
                section_id: sec.id,
                section_name: sec.section
              });
            });
          } catch (e) {
            console.error('Failed to load sections for class ' + cls.id);
          }
        }
        setClassSectionMappings(mappings);
        loadSubjectGroups();
      } catch (err) {
        showNotification('Failed to initialize page data', 'danger');
      }
    }
    init();
  }, []);

  const handleSubjectCheckboxChange = (subjectId) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleClassSectionCheckboxChange = (classSectionId) => {
    setSelectedClassSectionIds(prev => {
      if (prev.includes(classSectionId)) {
        return prev.filter(id => id !== classSectionId);
      } else {
        return [...prev, classSectionId];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      showNotification('Subject Group Name is required', 'warning');
      return;
    }
    if (selectedSubjectIds.length === 0) {
      showNotification('Please select at least one subject', 'warning');
      return;
    }
    if (selectedClassSectionIds.length === 0) {
      showNotification('Please select at least one class section', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/subject-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: groupId,
          name: groupName,
          description,
          subject_ids: selectedSubjectIds,
          class_section_ids: selectedClassSectionIds,
          session_id: 1
        })
      });

      const json = await res.json();
      if (json.success) {
        showNotification(groupId ? 'Subject Group updated successfully' : 'Subject Group created successfully', 'success');
        resetForm();
        loadSubjectGroups();
      } else {
        showNotification(json.message || 'Failed to save subject group', 'danger');
      }
    } catch (err) {
      showNotification('Error saving subject group', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setGroupId(group.id);
    setGroupName(group.name);
    setDescription(group.description || '');
    setSelectedSubjectIds(group.subjects.map(s => s.id));
    setSelectedClassSectionIds(group.sections.map(s => s.class_section_id));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Subject Group? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/academics/subject-groups/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Subject Group deleted successfully', 'success');
        loadSubjectGroups();
      } else {
        showNotification(json.message || 'Failed to delete subject group', 'danger');
      }
    } catch (err) {
      showNotification('Error deleting subject group', 'danger');
    }
  };

  const resetForm = () => {
    setGroupId(null);
    setGroupName('');
    setDescription('');
    setSelectedSubjectIds([]);
    setSelectedClassSectionIds([]);
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
          Subject Group
        </h2>
        <p className="text-zinc-400 text-sm">
          Organize academic subjects into groups and map them to classes and sections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left subject group table (2/3 width) */}
        <div className="lg:col-span-2 bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white">Subject Groups</h3>
            <button
              onClick={loadSubjectGroups}
              disabled={loading}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-zinc-500 text-sm">
              Loading subject groups...
            </div>
          ) : subjectGroups.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No subject groups defined
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Subjects</th>
                    <th className="py-3.5 px-4">Class Sections</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {subjectGroups.map((group, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-zinc-500 line-clamp-1">{group.description}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {group.subjects.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-zinc-900 text-zinc-300 rounded text-[11px] border border-white/5"
                            >
                              {sub.name} ({sub.code})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {group.sections.map((sec, csIdx) => (
                            <span
                              key={csIdx}
                              className="px-2 py-0.5 bg-indigo-950/40 text-indigo-300 rounded text-[11px] border border-indigo-500/10"
                            >
                              {sec.class_name} ({sec.section_name})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(group)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(group.id)}
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

        {/* Right configuration form (1/3 width) */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl backdrop-blur-xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-semibold text-white">
                {groupId ? 'Edit Subject Group' : 'Create Subject Group'}
              </h3>
              {groupId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Science Group"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Group description..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Subjects
              </label>
              <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 max-h-[160px] overflow-y-auto space-y-2.5">
                {subjects.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedSubjectIds.includes(sub.id)}
                      onChange={() => handleSubjectCheckboxChange(sub.id)}
                      className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>{`${sub.name} (${sub.code})`}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Class Sections
              </label>
              <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 max-h-[180px] overflow-y-auto space-y-2.5">
                {classSectionMappings.length === 0 ? (
                  <p className="text-zinc-600 text-xs py-2">Loading class sections...</p>
                ) : (
                  classSectionMappings.map(mapping => (
                    <label key={mapping.class_section_id} className="flex items-center gap-2.5 text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedClassSectionIds.includes(mapping.class_section_id)}
                        onChange={() => handleClassSectionCheckboxChange(mapping.class_section_id)}
                        className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span>{`${mapping.class_name} - ${mapping.section_name}`}</span>
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
                <Save size={14} /> {submitting ? 'Saving...' : 'Save Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
