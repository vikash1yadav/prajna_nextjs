'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { ShieldAlert, Plus, Edit2, Trash2, RotateCcw, Calendar, DollarSign, ListCollapse, Trash } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function FeesMasterPage() {
  const { data: response, error, isLoading } = useSWR('/api/fees/masters', fetcher);
  const items = response?.data || [];

  const { data: groupsRes } = useSWR('/api/fees/groups', fetcher);
  const groups = groupsRes?.data || [];

  const { data: typesRes } = useSWR('/api/fees/types', fetcher);
  const types = typesRes?.data || [];

  // Form State
  const [feeGroupId, setFeeGroupId] = useState('');
  const [feeTypeId, setFeeTypeId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [fineType, setFineType] = useState('none');
  const [fineAmount, setFineAmount] = useState('');
  const [finePercentage, setFinePercentage] = useState('');
  const [finePerDay, setFinePerDay] = useState(false);
  const [cumulativeFines, setCumulativeFines] = useState([]);

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Expanded detail state
  const [expandedMasterId, setExpandedMasterId] = useState(null);

  // Handle Edit Action
  const handleEditClick = (item) => {
    setEditId(item.id);
    setFeeGroupId(item.fee_groups_id);
    setFeeTypeId(item.feetype_id);
    setAmount(item.amount);
    // Format date string to YYYY-MM-DD
    const dateFormatted = item.due_date ? item.due_date.substring(0, 10) : '';
    setDueDate(dateFormatted);
    setFineType(item.fine_type || 'none');
    setFineAmount(item.fine_amount || '');
    setFinePercentage(item.fine_percentage || '');
    setFinePerDay(item.fine_per_day === 1);
    setCumulativeFines(item.cumulative_fines || []);
    setStatusMessage(null);
  };

  // Reset Form
  const handleReset = () => {
    setEditId(null);
    setFeeGroupId('');
    setFeeTypeId('');
    setAmount('');
    setDueDate('');
    setFineType('none');
    setFineAmount('');
    setFinePercentage('');
    setFinePerDay(false);
    setCumulativeFines([]);
    setStatusMessage(null);
  };

  // Cumulative Fine helpers
  const addCumulativeRow = () => {
    setCumulativeFines([...cumulativeFines, { overdue_day: '', fine_amount: '' }]);
  };

  const updateCumulativeRow = (index, field, value) => {
    const updated = [...cumulativeFines];
    updated[index][field] = value;
    setCumulativeFines(updated);
  };

  const removeCumulativeRow = (index) => {
    setCumulativeFines(cumulativeFines.filter((_, i) => i !== index));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feeGroupId) {
      setStatusMessage({ type: 'error', text: 'Please select a Fee Group' });
      return;
    }
    if (!feeTypeId) {
      setStatusMessage({ type: 'error', text: 'Please select a Fee Type' });
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    if (!dueDate) {
      setStatusMessage({ type: 'error', text: 'Please select a Due Date' });
      return;
    }

    // Validation for Fines
    if (fineType === 'fix' && (!fineAmount || isNaN(fineAmount))) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid fine amount' });
      return;
    }
    if (fineType === 'percentage' && (!finePercentage || isNaN(finePercentage))) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid fine percentage' });
      return;
    }
    if (fineType === 'cumulative') {
      if (cumulativeFines.length === 0) {
        setStatusMessage({ type: 'error', text: 'Please add at least one cumulative fine row' });
        return;
      }
      for (let i = 0; i < cumulativeFines.length; i++) {
        const row = cumulativeFines[i];
        if (!row.overdue_day || isNaN(row.overdue_day) || parseInt(row.overdue_day) <= 0) {
          setStatusMessage({ type: 'error', text: `Row ${i+1}: Please enter a valid overdue day` });
          return;
        }
        if (!row.fine_amount || isNaN(row.fine_amount) || parseFloat(row.fine_amount) < 0) {
          setStatusMessage({ type: 'error', text: `Row ${i+1}: Please enter a valid fine amount` });
          return;
        }
      }
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const url = editId ? `/api/fees/masters/${editId}` : '/api/fees/masters';
      const method = editId ? 'PUT' : 'POST';

      const payload = {
        fee_groups_id: parseInt(feeGroupId),
        feetype_id: parseInt(feeTypeId),
        amount: parseFloat(amount),
        due_date: dueDate,
        fine_type: fineType,
        fine_amount: fineType === 'fix' ? parseFloat(fineAmount) : 0,
        fine_percentage: fineType === 'percentage' ? parseFloat(finePercentage) : 0,
        fine_per_day: (fineType === 'fix' || fineType === 'percentage') && finePerDay ? 1 : 0,
        cumulative_fines: fineType === 'cumulative' ? cumulativeFines.map(f => ({
          overdue_day: parseInt(f.overdue_day),
          fine_amount: parseFloat(f.fine_amount)
        })) : []
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
          text: editId ? 'Fees Master updated successfully!' : 'Fees Master created successfully!'
        });
        handleReset();
        mutate('/api/fees/masters');
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
    if (!confirm('Are you sure you want to delete this Fees Master configuration?')) {
      return;
    }

    try {
      const res = await fetch(`/api/fees/masters/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        mutate('/api/fees/masters');
      } else {
        alert(data.message || 'Failed to delete Fees Master');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <ShieldAlert size={28} /> Fees Master
        </h2>
        <p className="text-zinc-400 text-sm">Assign fee types to fee groups, setup due dates, configure fine policies, and specify cumulative overdue structures.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Create/Edit Form */}
        <div className="col-span-1 md:col-span-5">
          <div className="glass-card flex flex-col gap-4 border-indigo-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Fees Master' : 'Create Fees Master'}
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
              {/* Fee Group */}
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Fee Group <span className="text-rose-500">*</span>
                </label>
                <select
                  className="input-field py-2.5"
                  value={feeGroupId}
                  onChange={(e) => setFeeGroupId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Fee Type */}
              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Fee Type <span className="text-rose-500">*</span>
                </label>
                <select
                  className="input-field py-2.5"
                  value={feeTypeId}
                  onChange={(e) => setFeeTypeId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.type} ({t.code})</option>
                  ))}
                </select>
              </div>

              {/* Due Date & Amount Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Amount ($) <span className="text-rose-500">*</span>
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
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Fine Setup */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-white/90">Fine Setup</h4>
                
                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Fine Type
                  </label>
                  <select
                    className="input-field py-2.5"
                    value={fineType}
                    onChange={(e) => setFineType(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="none">None</option>
                    <option value="fix">Fix Amount Fine</option>
                    <option value="percentage">Percentage Fine</option>
                    <option value="cumulative">Cumulative Fine (Overdue levels)</option>
                  </select>
                </div>

                {/* Fix Amount Fine inputs */}
                {fineType === 'fix' && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Fine Amount ($) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        placeholder="0.00"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="finePerDayFix"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
                        checked={finePerDay}
                        onChange={(e) => setFinePerDay(e.target.checked)}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="finePerDayFix" className="text-xs font-medium text-zinc-300 cursor-pointer">
                        Per Day Fine?
                      </label>
                    </div>
                  </div>
                )}

                {/* Percentage Fine inputs */}
                {fineType === 'percentage' && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div className="form-group flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Fine Percentage (%) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        placeholder="0.00"
                        value={finePercentage}
                        onChange={(e) => setFinePercentage(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="finePerDayPct"
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0"
                        checked={finePerDay}
                        onChange={(e) => setFinePerDay(e.target.checked)}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="finePerDayPct" className="text-xs font-medium text-zinc-300 cursor-pointer">
                        Per Day Fine?
                      </label>
                    </div>
                  </div>
                )}

                {/* Cumulative Fine Table */}
                {fineType === 'cumulative' && (
                  <div className="flex flex-col gap-2 border border-white/5 rounded-lg p-3 bg-white/5 animate-fadeIn">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overdue Fines</span>
                      <button
                        type="button"
                        onClick={addCumulativeRow}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded transition-colors"
                      >
                        + Add Row
                      </button>
                    </div>

                    {cumulativeFines.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {cumulativeFines.map((row, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="number"
                              className="input-field flex-1 py-1.5 text-sm"
                              placeholder="Days overdue"
                              value={row.overdue_day}
                              onChange={(e) => updateCumulativeRow(idx, 'overdue_day', e.target.value)}
                              disabled={isSubmitting}
                            />
                            <input
                              type="number"
                              step="0.01"
                              className="input-field flex-1 py-1.5 text-sm"
                              placeholder="Fine ($)"
                              value={row.fine_amount}
                              onChange={(e) => updateCumulativeRow(idx, 'fine_amount', e.target.value)}
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => removeCumulativeRow(idx)}
                              className="p-2 text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-zinc-500">
                        No overdue levels configured. Click "+ Add Row" to define one.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
                >
                  {editId ? 'Update' : 'Save'}
                </button>
                {(feeGroupId || feeTypeId || amount || dueDate || fineType !== 'none' || editId) && (
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
        <div className="col-span-1 md:col-span-7">
          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Fees Master List</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {items.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Loading fees master configs...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                Failed to load list.
              </div>
            ) : items.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Type (Code)</th>
                      <th>Amount ($)</th>
                      <th>Due Date</th>
                      <th>Fine Policy</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isExpanded = expandedMasterId === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            className={`hover:bg-white/5 transition-colors ${
                              editId === item.id ? 'bg-indigo-500/5' : ''
                            }`}
                          >
                            <td className="font-semibold text-white">{item.fee_group_name}</td>
                            <td className="text-zinc-300 text-sm">{item.fee_type_name} ({item.fee_type_code})</td>
                            <td className="font-mono text-white">${parseFloat(item.amount).toFixed(2)}</td>
                            <td className="text-zinc-400 text-sm font-medium">
                              {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                            </td>
                            <td>
                              {item.fine_type === 'none' && <span className="text-zinc-500 text-xs font-semibold">None</span>}
                              {item.fine_type === 'fix' && (
                                <span className="text-amber-400 text-xs font-semibold">
                                  ${parseFloat(item.fine_amount).toFixed(2)} {item.fine_per_day === 1 ? '/ day' : 'flat'}
                                </span>
                              )}
                              {item.fine_type === 'percentage' && (
                                <span className="text-amber-400 text-xs font-semibold">
                                  {parseFloat(item.fine_percentage).toFixed(2)}% {item.fine_per_day === 1 ? '/ day' : 'flat'}
                                </span>
                              )}
                              {item.fine_type === 'cumulative' && (
                                <button
                                  onClick={() => setExpandedMasterId(isExpanded ? null : item.id)}
                                  className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs font-semibold flex items-center gap-1"
                                >
                                  Cumulative ({item.cumulative_fines?.length || 0} levels)
                                </button>
                              )}
                            </td>
                            <td className="text-right flex justify-end gap-2 p-3">
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

                          {/* Expanded Cumulative Fines details row */}
                          {item.fine_type === 'cumulative' && isExpanded && (
                            <tr className="bg-white/[0.02] border-b border-white/5">
                              <td colSpan="6" className="p-4 pl-12">
                                <div className="max-w-md bg-zinc-900 border border-white/5 rounded-lg p-3">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Cumulative Fine Structure</h5>
                                  <div className="flex flex-col gap-1.5 font-mono text-sm">
                                    <div className="grid grid-cols-2 text-zinc-500 font-semibold text-xs border-b border-white/5 pb-1 uppercase">
                                      <span>Overdue Days</span>
                                      <span>Fine Amount</span>
                                    </div>
                                    {item.cumulative_fines?.map((cf, cidx) => (
                                      <div key={cidx} className="grid grid-cols-2 text-zinc-300 py-0.5">
                                        <span>{cf.overdue_day} Days</span>
                                        <span className="text-amber-400">${parseFloat(cf.fine_amount).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    {(!item.cumulative_fines || item.cumulative_fines.length === 0) && (
                                      <div className="text-zinc-500 text-xs py-1">No levels defined</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No fees master configurations found. Configure one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
