'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Search, HelpCircle, Save, Calendar, User } from 'lucide-react';

export default function CarryForwardPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // Filters State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Form Details
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsList, setStudentsList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes');
        const json = await res.json();
        setClasses(json.data || []);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    }
    loadClasses();
  }, []);

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
        console.error('Failed to load sections', err);
      }
    }
    loadSections();
  }, [selectedClass]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) {
      alert('Please select Class and Section');
      return;
    }

    setLoading(true);
    setSearched(true);
    setStudentsList([]);

    try {
      const res = await fetch(`/api/fees/carry-forward?class_id=${selectedClass}&section_id=${selectedSection}&session_id=21`);
      const data = await res.json();

      if (data.success) {
        setStudentsList(data.data.students || []);
        setIsUpdate(data.data.is_update || false);
      } else {
        alert(data.error || 'Failed to fetch preceding session balance');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (index, val) => {
    const copy = [...studentsList];
    copy[index].balance = val === '' ? '' : parseFloat(val);
    setStudentsList(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (studentsList.length === 0) return;

    // Validate due date
    if (!dueDate) {
      alert('Please specify the Due Date for carry forward balance fees.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        due_date: dueDate,
        students: studentsList.map(s => ({
          student_session_id: s.student_session_id,
          amount: parseFloat(s.balance || 0)
        })),
        session_id: 21
      };

      const res = await fetch('/api/fees/carry-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(isUpdate ? 'Carried forward balances updated successfully!' : 'Carried forward balances applied successfully!', 'success');
        // Refresh
        handleSearch({ preventDefault: () => {} });
      } else {
        alert(data.error || 'Failed to submit carried forward balances');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <RotateCcw size={28} /> Fees Carry Forward
        </h2>
        <p className="text-zinc-400 text-sm">Transfer outstanding dues/balances from the preceding academic session to the current session.</p>
      </div>

      {/* Filters Form */}
      <div className="glass-card border-indigo-500/10">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class <span className="text-rose-500">*</span></label>
            <select
              className="input-field py-2.5"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading || saving}
              required
            >
              <option value="">Select Class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section <span className="text-rose-500">*</span></label>
            <select
              className="input-field py-2.5"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={loading || saving || !selectedClass}
              required
            >
              <option value="">Select Section...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.section}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || saving}
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 h-[46px] flex items-center justify-center gap-2"
          >
            <Search size={18} /> {loading ? 'Searching...' : 'Search Students'}
          </button>
        </form>
      </div>

      {/* Students List Form */}
      {searched && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-sm text-zinc-300 flex items-start gap-3 max-w-4xl">
            <HelpCircle size={20} className="text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-white block mb-0.5">How it works:</span>
              <span>
                If balances have not been carried forward yet, the system dynamically calculates outstanding balances from the preceding session. If already carried forward, you will view the existing records. You can manually adjust the values for each student in the input fields below before saving.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {studentsList.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5 max-w-4xl">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-zinc-400" />
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Carry Forward Dues Due Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="input-field max-w-[200px] py-1.5"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 px-6 py-2.5 rounded-lg flex items-center gap-2"
                >
                  <Save size={18} /> {saving ? 'Saving...' : isUpdate ? 'Update Balances' : 'Apply Carry Forward'}
                </button>
              </div>
            )}

            <div className="glass-card !p-0 overflow-hidden border-indigo-500/10 max-w-4xl">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Student Balance Sheet</h3>
                <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                  Students: {studentsList.length}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-zinc-400 animate-pulse">
                  Querying student previous session accounts...
                </div>
              ) : studentsList.length > 0 ? (
                <div className="table-container !mt-0 !border-none overflow-x-auto">
                  <table className="data-table whitespace-nowrap">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Admission No</th>
                        <th>Roll No</th>
                        <th>Father Name</th>
                        <th>Admission Date</th>
                        <th className="w-[180px]">Carry Forward Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((item, index) => (
                        <tr key={item.student_session_id} className="hover:bg-white/5 transition-colors">
                          <td className="font-medium text-white flex items-center gap-2 py-4">
                            <User size={14} className="text-zinc-500" />
                            {item.name}
                          </td>
                          <td className="font-mono text-zinc-400 text-sm">{item.admission_no || '-'}</td>
                          <td className="font-mono text-zinc-400 text-sm">{item.roll_no || '-'}</td>
                          <td className="text-zinc-300 text-sm">{item.father_name || '-'}</td>
                          <td className="text-zinc-400 text-sm">{item.admission_date || '-'}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              className="input-field text-right py-1 px-2.5 font-bold text-indigo-400"
                              placeholder="0.00"
                              value={item.balance}
                              onChange={(e) => handleAmountChange(index, e.target.value)}
                              disabled={saving}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-500">
                  No student accounts found in this class section.
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
