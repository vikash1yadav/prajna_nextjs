'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { GraduationCap, Trash2, Edit2, RotateCcw } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ClassPage() {
  const { data: classesRes, isLoading: classesLoading } = useSWR('/api/classes', fetcher);
  const { data: sectionsRes, isLoading: sectionsLoading } = useSWR('/api/sections', fetcher);

  const classes = classesRes?.data || [];
  const allSections = sectionsRes?.data || [];

  // Local state for loaded class-section mappings: classId -> array of sections
  const [classSectionsMap, setClassSectionsMap] = useState({});
  const [loadingMappings, setLoadingMappings] = useState({});

  // Form State
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch sections mapping for each class dynamically when classes list changes
  useEffect(() => {
    if (classes.length > 0) {
      classes.forEach(async (cls) => {
        if (classSectionsMap[cls.id] === undefined && !loadingMappings[cls.id]) {
          setLoadingMappings(prev => ({ ...prev, [cls.id]: true }));
          try {
            const res = await fetch(`/api/classes/${cls.id}/sections`);
            const json = await res.json();
            if (json.success) {
              setClassSectionsMap(prev => ({ ...prev, [cls.id]: json.data || [] }));
            }
          } catch (e) {
            console.error('Failed to load sections for class', cls.id, e);
          } finally {
            setLoadingMappings(prev => ({ ...prev, [cls.id]: false }));
          }
        }
      });
    }
  }, [classes]);

  const handleReset = () => {
    setClassId(null);
    setClassName('');
    setSelectedSections([]);
    setStatusMessage(null);
  };

  const handleEdit = (cls) => {
    setClassId(cls.id);
    setClassName(cls.class || '');
    
    // Set mapped sections in form
    const currentMappings = classSectionsMap[cls.id] || [];
    setSelectedSections(currentMappings.map(s => s.id));
    setStatusMessage(null);
  };

  const handleSectionToggle = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) {
      setStatusMessage({ type: 'error', text: 'Class name is required' });
      return;
    }
    if (selectedSections.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please map at least one section' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      class: className.trim(),
      sections: selectedSections
    };

    if (classId) {
      payload.id = classId;
    }

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: classId ? 'Class updated successfully!' : 'Class added successfully!'
        });
        
        // Invalidate map entry for this class to force re-fetch
        if (classId) {
          setClassSectionsMap(prev => {
            const next = { ...prev };
            delete next[classId];
            return next;
          });
        }
        
        handleReset();
        mutate('/api/classes');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class? This will delete mapped sections and student records.')) {
      return;
    }
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setClassSectionsMap(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        mutate('/api/classes');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete class');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <GraduationCap size={28} /> Class Management
        </h2>
        <p className="text-zinc-400 text-sm">Create grade levels or classes and map them to their corresponding student sections.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">
              {classId ? 'Edit Class' : 'Add Class'}
            </h3>

            {statusMessage && (
              <div className={`p-3 rounded-lg border text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class Name *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Class 1, Class 2" 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>

              <div className="form-group flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sections *</label>
                {sectionsLoading ? (
                  <div className="text-xs text-zinc-400 animate-pulse">Loading sections...</div>
                ) : allSections.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto bg-black/20 p-3 rounded-lg border border-white/5">
                    {allSections.map((sec) => (
                      <label key={sec.id} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedSections.includes(sec.id)} 
                          onChange={() => handleSectionToggle(sec.id)} 
                          className="accent-emerald-500 w-4 h-4 rounded" 
                          disabled={isSubmitting}
                        />
                        {sec.section}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-rose-400">No sections defined yet. Create sections first!</div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                  {classId ? 'Update Class' : 'Save Class'}
                </button>
                {(classId || className || selectedSections.length > 0) && (
                  <button type="button" onClick={handleReset} className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5" title="Reset Form">
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Data Grid Panel */}
        <div className="col-span-1 lg:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Class Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {classes.length}
              </span>
            </div>

            {classesLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading classes...</div>
            ) : classes.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Mapped Sections</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => {
                      const sectionsMapped = classSectionsMap[c.id] || [];
                      const mappingLoading = loadingMappings[c.id];

                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="font-semibold text-white">{c.class}</td>
                          <td className="p-3">
                            {mappingLoading ? (
                              <span className="text-xs text-zinc-500 animate-pulse">Loading...</span>
                            ) : sectionsMapped.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {sectionsMapped.map((s) => (
                                  <span key={s.id} className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                    {s.section}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-rose-400 font-medium">No Sections Mapped</span>
                            )}
                          </td>
                          <td className="text-right flex justify-end gap-2 p-3">
                            <button onClick={() => handleEdit(c)} className="p-2 text-zinc-400 hover:text-emerald-400 border border-transparent hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No classes defined yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
