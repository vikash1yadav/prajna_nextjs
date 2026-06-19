'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { TrendingDown, Plus, Edit2, Trash2, RotateCcw, Eye, X, Search, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ExpensePage() {
  const { data: expenseRes, isLoading: isExpenseLoading } = useSWR('/api/expenses', fetcher);
  const { data: headsRes } = useSWR('/api/expenses/heads', fetcher);

  const expenses = expenseRes?.data || [];
  const heads = headsRes?.data || [];

  // Form State
  const [name, setName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [expHeadId, setExpHeadId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [documents, setDocuments] = useState('');

  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEditClick = (exp) => {
    setEditId(exp.id);
    setName(exp.name);
    setInvoiceNo(exp.invoice_no || '');
    setExpHeadId(exp.exp_head_id ? String(exp.exp_head_id) : '');
    setDate(exp.date || new Date().toISOString().slice(0, 10));
    setAmount(String(exp.amount));
    setNote(exp.note || '');
    setDocuments(exp.documents || '');
    setStatusMessage(null);
  };

  const handleReset = () => {
    setEditId(null);
    setName('');
    setInvoiceNo('');
    setExpHeadId('');
    setDate(new Date().toISOString().slice(0, 10));
    setAmount('');
    setNote('');
    setDocuments('');
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Name/Title is required' });
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setStatusMessage({ type: 'error', text: 'Enter a valid positive amount' });
      return;
    }
    if (!expHeadId) {
      setStatusMessage({ type: 'error', text: 'Select an Expense Head category' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      id: editId || undefined,
      name: name.trim(),
      invoice_no: invoiceNo.trim() || null,
      exp_head_id: parseInt(expHeadId),
      date: date || null,
      amount: parseFloat(amount),
      note: note.trim() || null,
      documents: documents.trim() || null
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: editId ? 'Expense record updated successfully!' : 'Expense record created successfully!'
        });
        handleReset();
        mutate('/api/expenses');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) {
      return;
    }
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate('/api/expenses');
        if (selectedExpense?.id === id) {
          setSelectedExpense(null);
        }
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  // Search Filter
  const filteredExpenses = expenses.filter(exp => {
    const term = searchQuery.toLowerCase();
    return (
      exp.name?.toLowerCase().includes(term) ||
      exp.invoice_no?.toLowerCase().includes(term) ||
      exp.note?.toLowerCase().includes(term) ||
      exp.ExpenseHead?.exp_category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-purple-400 flex items-center gap-2">
          <TrendingDown size={28} /> Expense Management
        </h2>
        <p className="text-zinc-400 text-sm">Track and analyze miscellaneous expenses incurred by the institution (e.g. utilities, salaries, repairs).</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="col-span-1 lg:col-span-4">
          <div className="glass-card flex flex-col gap-4 border-purple-500/10">
            <h3 className="text-lg font-semibold text-white">
              {editId ? 'Edit Expense Details' : 'Add Expense'}
            </h3>

            {statusMessage && (
              <div className={`p-3 rounded-lg border text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Expense Head Category *</label>
                <Select value={expHeadId || undefined} onValueChange={(val) => setExpHeadId(val || '')} disabled={isSubmitting}>
                  <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                    <SelectValue placeholder="Choose Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {heads.map(h => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.exp_category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name / Title *</label>
                <input type="text" className="input-field" placeholder="Rent, Salary, Bill, etc." value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Invoice No</label>
                  <input type="text" className="input-field" placeholder="EXP-2026-X" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</label>
                  <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount ($) *</label>
                  <input type="number" step="0.01" className="input-field" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Document Link / Path</label>
                  <input type="text" className="input-field" placeholder="doc_url_or_path" value={documents} onChange={(e) => setDocuments(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note / Remarks</label>
                <textarea className="input-field min-h-[80px] resize-none py-1.5" placeholder="Enter details..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isSubmitting} />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 bg-purple-600 hover:bg-purple-500 shadow-purple-600/20">
                  {editId ? 'Update' : 'Save'}
                </button>
                {(name || invoiceNo || expHeadId || amount || note || documents || editId) && (
                  <button type="button" onClick={handleReset} className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5" title="Reset Form">
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Data Grid Panel */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-4">
          {/* Search bar card */}
          <div className="glass-card flex items-center gap-3 p-4 border-purple-500/10">
            <Search className="text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search expense by title, invoice number, category, or note..."
              className="bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 text-sm flex-grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="glass-card !p-0 overflow-hidden border-purple-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Expense Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {filteredExpenses.length}
              </span>
            </div>

            {isExpenseLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading expense data...</div>
            ) : filteredExpenses.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Name / Title</th>
                      <th>Invoice No</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className={`hover:bg-white/5 transition-colors ${editId === exp.id ? 'bg-purple-500/5' : ''}`}>
                        <td className="font-semibold text-white">{exp.name}</td>
                        <td className="text-zinc-400 text-sm font-mono">{exp.invoice_no || '-'}</td>
                        <td className="text-zinc-300 text-sm">{exp.ExpenseHead?.exp_category || '-'}</td>
                        <td className="text-zinc-400 text-sm">{exp.date}</td>
                        <td className="text-purple-400 font-semibold font-mono">${parseFloat(exp.amount).toFixed(2)}</td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          <button onClick={() => setSelectedExpense(exp)} className="p-2 text-zinc-400 hover:text-white border border-transparent hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(exp)} className={`p-2 rounded-lg transition-colors border ${editId === exp.id ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10'}`} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(exp.id)} className="p-2 text-zinc-400 hover:text-rose-400 border border-transparent hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No expense records found matching your filters.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full border-purple-500/20 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedExpense(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedExpense.name}</h3>
              <p className="text-sm text-zinc-400 font-mono">Expense Record ID: #{selectedExpense.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-white/5 pt-4">
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Invoice Number</span>
                <span className="text-zinc-200 font-mono">{selectedExpense.invoice_no || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Expense Head Category</span>
                <span className="text-zinc-200">{selectedExpense.ExpenseHead?.exp_category || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Date Logged</span>
                <span className="text-zinc-200">{selectedExpense.date}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider">Total Amount Spent</span>
                <span className="text-purple-400 font-bold font-mono">${parseFloat(selectedExpense.amount).toFixed(2)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block text-xs font-semibold uppercase tracking-wider mb-1">Attached Document / Invoice</span>
                {selectedExpense.documents ? (
                  <a href={selectedExpense.documents} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    <FileText size={16} /> {selectedExpense.documents}
                  </a>
                ) : (
                  <span className="text-zinc-400">No document attached.</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Notes / Remarks</span>
              <p className="text-zinc-300 text-sm bg-white/5 p-3 rounded-lg border border-white/5 min-h-[80px] whitespace-pre-wrap">{selectedExpense.note || 'No notes logged.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
