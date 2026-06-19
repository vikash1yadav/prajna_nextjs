'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Percent, Plus, Edit2, Trash2, RotateCcw, Users, ArrowLeft, Search, Check, Save } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function FeesDiscountPage() {
  // Tabs/Views: 'list' or 'allot'
  const [view, setView] = useState('list');
  const [allotDiscount, setAllotDiscount] = useState(null);

  // Discount list
  const { data: response, error, isLoading } = useSWR('/api/fees/discounts', fetcher);
  const discounts = response?.data || [];

  // Form State for Discount CRUD
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('fix');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Allotment Filters State
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gender, setGender] = useState('');
  const [rteStatus, setRteStatus] = useState('');
  
  // Allotment students list state
  const [students, setStudents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentSessionIds, setSelectedStudentSessionIds] = useState([]);
  const [allotStatusMessage, setAllotStatusMessage] = useState(null);

  // Dropdown options
  const { data: classesRes } = useSWR('/api/classes', fetcher);
  const classes = classesRes?.data || [];

  const { data: sectionsRes } = useSWR(classId ? `/api/classes/${classId}/sections` : null, fetcher);
  const sections = sectionsRes?.data || [];

  const { data: categoriesRes } = useSWR('/api/categories', fetcher);
  const categories = categoriesRes?.data || [];

  // Handle Edit Action
  const handleEditClick = (item) => {
    setEditId(item.id);
    setName(item.name);
    setCode(item.code);
    setType(item.type || 'fix');
    setAmount(item.amount || '');
    setPercentage(item.percentage || '');
    setDescription(item.description || '');
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setName('');
    setCode('');
    setType('fix');
    setAmount('');
    setPercentage('');
    setDescription('');
    setStatusMessage(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Discount name is required' });
      return;
    }
    if (!code.trim()) {
      setStatusMessage({ type: 'error', text: 'Discount code is required' });
      return;
    }
    if (type === 'fix' && (!amount || isNaN(amount) || parseFloat(amount) <= 0)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    if (type === 'percentage' && (!percentage || isNaN(percentage) || parseFloat(percentage) <= 0 || parseFloat(percentage) > 100)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid percentage (0-100)' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `/api/fees/discounts/${editId}` : '/api/fees/discounts';
      const method = editId ? 'PUT' : 'POST';

      const payload = {
        name: name.trim(),
        code: code.trim(),
        type,
        amount: type === 'fix' ? parseFloat(amount) : 0,
        percentage: type === 'percentage' ? parseFloat(percentage) : 0,
        description: description.trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'Discount updated successfully!' : 'Discount created successfully!'
        });
        handleReset();
        mutate('/api/fees/discounts');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'An error occurred' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Action
  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this fees discount?')) {
      return;
    }

    try {
      const res = await fetch(`/api/fees/discounts/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate('/api/fees/discounts');
      } else {
        alert(data.message || 'Failed to delete fees discount');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  // Switch to allotment panel
  const handleAssignClick = (discount) => {
    setAllotDiscount(discount);
    setView('allot');
    setStudents([]);
    setSelectedStudentSessionIds([]);
    setAllotStatusMessage(null);
    setClassId('');
    setSectionId('');
    setCategoryId('');
    setGender('');
    setRteStatus('');
  };

  // Run assignment student search
  const handleSearchStudents = async (e) => {
    e.preventDefault();
    if (!classId) {
      setAllotStatusMessage({ type: 'error', text: 'Class is required to search students' });
      return;
    }
    
    setIsSearching(true);
    setAllotStatusMessage(null);

    try {
      const queryParams = new URLSearchParams({
        class_id: classId,
        discount_id: allotDiscount.id
      });
      if (sectionId) queryParams.append('section_id', sectionId);
      if (categoryId) queryParams.append('category_id', categoryId);
      if (gender) queryParams.append('gender', gender);
      if (rteStatus) queryParams.append('rte_status', rteStatus);

      const res = await fetch(`/api/fees/discounts/search-students?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setStudents(data.data || []);
        // Populate checked students
        const checked = data.data
          .filter(s => s.student_fees_discount_id && parseInt(s.student_fees_discount_id) !== 0)
          .map(s => s.student_session_id);
        setSelectedStudentSessionIds(checked);
      } else {
        setAllotStatusMessage({ type: 'error', text: data.message || 'Failed to load students' });
      }
    } catch (err) {
      console.error(err);
      setAllotStatusMessage({ type: 'error', text: 'Failed to search students' });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle student selection checkbox changes
  const handleSelectStudent = (studentSessionId) => {
    if (selectedStudentSessionIds.includes(studentSessionId)) {
      setSelectedStudentSessionIds(selectedStudentSessionIds.filter(id => id !== studentSessionId));
    } else {
      setSelectedStudentSessionIds([...selectedStudentSessionIds, studentSessionId]);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = students.map(s => s.student_session_id);
      setSelectedStudentSessionIds(allIds);
    } else {
      setSelectedStudentSessionIds([]);
    }
  };

  // Submit allotments to server
  const handleSaveAllotment = async () => {
    setIsSubmitting(true);
    setAllotStatusMessage(null);

    try {
      const payload = {
        discount_id: allotDiscount.id,
        student_session_ids: selectedStudentSessionIds,
        student_list: students.map(s => s.student_session_id)
      };

      const res = await fetch('/api/fees/discounts/allot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setAllotStatusMessage({ type: 'success', text: 'Allotment updated successfully!' });
      } else {
        setAllotStatusMessage({ type: 'error', text: data.message || 'An error occurred' });
      }
    } catch (err) {
      console.error(err);
      setAllotStatusMessage({ type: 'error', text: 'Failed to save allotment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'allot') {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Back button & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('list')}
            className="p-2.5 rounded-lg border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Assign Fees Discount</h2>
            <p className="text-zinc-400 text-sm">
              Allot discount <strong className="text-indigo-400">{allotDiscount.name} ({allotDiscount.code})</strong> to students.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card border-indigo-500/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search size={18} className="text-indigo-400" /> Filter Criteria
          </h3>

          <form onSubmit={handleSearchStudents} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="form-group flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class *</label>
              <select
                className="input-field py-2.5"
                value={classId}
                onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section</label>
              <select
                className="input-field py-2.5"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.section}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
              <select
                className="input-field py-2.5"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.category}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gender</label>
              <select
                className="input-field py-2.5"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">RTE Status</label>
              <select
                className="input-field py-2.5"
                value={rteStatus}
                onChange={(e) => setRteStatus(e.target.value)}
              >
                <option value="">Select RTE</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="col-span-full md:col-span-5 flex justify-end gap-3 mt-2">
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 px-6 py-2.5"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Status Message */}
        {allotStatusMessage && (
          <div
            className={`p-3 rounded-lg border text-sm max-w-xl ${
              allotStatusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {allotStatusMessage.text}
          </div>
        )}

        {/* Students List */}
        {students.length > 0 ? (
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Student Eligible List</h3>
              <button
                onClick={handleSaveAllotment}
                disabled={isSubmitting}
                className="btn bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Save size={16} /> Save Allotment
              </button>
            </div>

            <div className="table-container !mt-0 !border-none overflow-x-auto">
              <table className="data-table whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="w-12 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
                        checked={students.length > 0 && selectedStudentSessionIds.length === students.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th>Admission No</th>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class / Section</th>
                    <th>Father Name</th>
                    <th>Gender</th>
                    <th>RTE</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const isChecked = selectedStudentSessionIds.includes(student.student_session_id);
                    return (
                      <tr key={student.student_session_id} className="hover:bg-white/5 transition-colors">
                        <td className="text-center p-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
                            checked={isChecked}
                            onChange={() => handleSelectStudent(student.student_session_id)}
                          />
                        </td>
                        <td className="font-mono text-zinc-300 text-sm">{student.admission_no || '-'}</td>
                        <td className="font-mono text-zinc-300 text-sm">{student.roll_no || '-'}</td>
                        <td className="font-semibold text-white">
                          {[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}
                        </td>
                        <td className="text-zinc-300 text-sm">
                          {student.class} ({student.section})
                        </td>
                        <td className="text-zinc-300 text-sm">{student.father_name || '-'}</td>
                        <td className="text-zinc-400 text-sm font-medium">{student.gender || '-'}</td>
                        <td className="text-zinc-400 text-sm font-mono uppercase">{student.rte || 'no'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card py-12 text-center text-zinc-500 border-indigo-500/10">
            No students loaded. Filter by Class/Section and click Search above.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <Percent size={28} /> Fees Discount
        </h2>
        <p className="text-zinc-400 text-sm">Configure flat or percentage institution fee discounts and assign them in bulk to matching student segments.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Fees Discount' : 'Create Fees Discount'}
            </h3>

            {statusMessage && (
              <div
                className={`p-3 rounded-lg border text-sm ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter discount name (e.g. Staff Child)..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter code (e.g. DISC-10)..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Discount Type
                </label>
                <select
                  className="input-field py-2.5"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="fix">Fix Amount Discount ($)</option>
                  <option value="percentage">Percentage Discount (%)</option>
                </select>
              </div>

              {type === 'fix' ? (
                <div className="form-group flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Discount Amount ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div className="form-group flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Discount Percentage (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none py-2"
                  placeholder="Enter description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                >
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || code || amount || percentage || description || editId) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    title="Reset Form"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: List */}
        <div className="col-span-1 md:col-span-8">
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Fees Discount List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {discounts.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading discounts...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                Failed to load list.
              </div>
            ) : discounts.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Description</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/5 transition-colors ${
                          editId === item.id ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <td className="font-semibold text-white">{item.name}</td>
                        <td className="font-mono text-zinc-300 text-sm">{item.code}</td>
                        <td className="text-zinc-400 text-sm font-semibold uppercase">
                          {item.type === 'fix' ? 'Flat Amount' : 'Percentage'}
                        </td>
                        <td className="font-mono text-white">
                          {item.type === 'fix' ? `$${parseFloat(item.amount).toFixed(2)}` : `${parseFloat(item.percentage).toFixed(2)}%`}
                        </td>
                        <td className="text-zinc-300 text-sm max-w-[200px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button
                            onClick={() => handleAssignClick(item)}
                            className="p-2 text-indigo-400 hover:text-white border border-transparent hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Assign Students"
                          >
                            <Users size={16} /> Assign
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`p-2 rounded-lg transition-colors border ${
                              editId === item.id
                                ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                                : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'
                            }`}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No discounts found. Create a new one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
