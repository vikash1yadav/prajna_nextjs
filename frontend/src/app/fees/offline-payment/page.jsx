'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Landmark, Check, X, FileText, CheckCircle, AlertCircle, Calendar, DollarSign, User, Info, MessageSquare } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function OfflinePaymentsPage() {
  const { data: response, error, isLoading } = useSWR('/api/fees/offline-payments', fetcher);
  const items = response?.data || [];

  // Selected item for detail/modal view
  const [selectedItem, setSelectedItem] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Form states for approval/rejection
  const [status, setStatus] = useState('1'); // '1' = Approve, '2' = Reject
  const [amount, setAmount] = useState('');
  const [fine, setFine] = useState('0');
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenActionModal = (item) => {
    setSelectedItem(item);
    setStatus('1');
    setAmount(item.amount || '');
    setFine('0');
    setReply(item.reply || '');
    setIsActionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsActionModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (status === '1' && (!amount || parseFloat(amount) <= 0)) {
      alert('Please enter a valid approved amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/fees/offline-payments/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: status,
          amount: parseFloat(amount),
          fine: parseFloat(fine || 0),
          reply: reply.trim(),
          approved_by: 1 // Default Admin staff id
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(status === '1' ? 'Offline bank payment request approved successfully!' : 'Offline bank payment request rejected.', 'success');
        mutate('/api/fees/offline-payments');
        handleCloseModal();
      } else {
        alert(data.error || 'Failed to update payment request status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive === '1') {
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle size={12} /> Approved
        </span>
      );
    } else if (isActive === '2') {
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <X size={12} /> Rejected
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertCircle size={12} /> Pending
        </span>
      );
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
          <Landmark size={28} /> Offline Bank Payments
        </h2>
        <p className="text-zinc-400 text-sm">Review, approve, or decline student offline bank payment submission requests.</p>
      </div>

      {/* Main List */}
      <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Bank Payment Requests</h3>
          <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
            Total: {items.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">
            Loading bank payment requests...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400">
            Failed to load bank payment requests list.
          </div>
        ) : items.length > 0 ? (
          <div className="table-container !mt-0 !border-none overflow-x-auto">
            <table className="data-table whitespace-nowrap">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Admission No</th>
                  <th>Class (Section)</th>
                  <th>Fee Type</th>
                  <th>Reference</th>
                  <th>Payment Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="font-medium text-white">
                      {`${item.firstname || ''} ${item.middlename || ''} ${item.lastname || ''}`.trim()}
                    </td>
                    <td className="font-mono text-zinc-400 text-sm">{item.admission_no || '-'}</td>
                    <td className="text-zinc-300 text-sm">
                      {item.class} ({item.section})
                    </td>
                    <td className="text-zinc-300 text-sm">
                      <div className="font-semibold text-white">{item.fee_type_name || 'Transport Fees'}</div>
                      <div className="text-xs text-zinc-500 font-mono">{item.fee_group_name || ''}</div>
                    </td>
                    <td className="text-zinc-300 text-sm font-mono">
                      <div>Ref: {item.reference || '-'}</div>
                      <div className="text-xs text-zinc-500">From: {item.bank_from || '-'}</div>
                    </td>
                    <td className="text-zinc-400 text-sm">{item.payment_date || '-'}</td>
                    <td className="font-semibold text-indigo-400 text-sm">
                      ₹{parseFloat(item.amount || 0).toFixed(2)}
                    </td>
                    <td>{getStatusBadge(item.is_active)}</td>
                    <td className="text-right flex justify-end gap-2 p-3">
                      <button
                        onClick={() => handleOpenActionModal(item)}
                        className="btn bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
                      >
                        <Info size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            No offline bank payment requests found.
          </div>
        )}
      </div>

      {/* Review & Action Modal */}
      {isActionModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto border-indigo-500/20 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Landmark className="text-indigo-500" /> Review Payment Request
            </h3>

            {/* Request info summary grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Student</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <User size={14} className="text-indigo-400" />
                  {`${selectedItem.firstname || ''} ${selectedItem.middlename || ''} ${selectedItem.lastname || ''}`.trim()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Admission Number</span>
                <span className="text-zinc-300 font-mono">{selectedItem.admission_no || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Class (Section)</span>
                <span className="text-zinc-300">{selectedItem.class} ({selectedItem.section})</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Fee Account</span>
                <span className="text-zinc-300 font-semibold">{selectedItem.fee_type_name || 'Transport Fees'}</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2 border-t border-white/5 pt-2 mt-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Reference Details</span>
                <span className="text-zinc-300 font-mono">
                  Ref No: {selectedItem.reference || '-'} | Bank: {selectedItem.bank_from || '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Transferred to Account</span>
                <span className="text-zinc-300 font-mono">{selectedItem.bank_account_transferred || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Submitted Date</span>
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Calendar size={14} /> {selectedItem.submit_date ? new Date(selectedItem.submit_date).toLocaleString() : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs uppercase font-semibold">Requested Amount</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  <DollarSign size={14} /> ₹{parseFloat(selectedItem.amount || 0).toFixed(2)}
                </span>
              </div>
              {selectedItem.attachment && (
                <div className="flex flex-col gap-1 col-span-2 border-t border-white/5 pt-2 mt-1">
                  <span className="text-zinc-500 text-xs uppercase font-semibold">Receipt Proof Attachment</span>
                  <a
                    href={`/uploads/offline_payments/${selectedItem.attachment}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors w-fit font-semibold mt-1"
                  >
                    <FileText size={16} /> View Receipt Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Action Form */}
            {selectedItem.is_active === '0' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Payment Action Status
                    </label>
                    <select
                      className="input-field py-2.5"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="1">Approve Payment</option>
                      <option value="2">Reject Payment</option>
                    </select>
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Approved Amount <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="Enter approved amount..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isSubmitting || status === '2'}
                      required={status === '1'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Approved Fine Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="Enter fine amount..."
                      value={fine}
                      onChange={(e) => setFine(e.target.value)}
                      disabled={isSubmitting || status === '2'}
                    />
                  </div>

                  <div className="form-group flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Approval Date
                    </label>
                    <input
                      type="text"
                      className="input-field opacity-60"
                      value={new Date().toLocaleDateString()}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Remarks / Reply Note
                  </label>
                  <textarea
                    className="input-field min-h-[90px] resize-none py-2"
                    placeholder="Enter approval note or rejection reason..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn px-5 py-2.5 rounded-lg text-white font-semibold flex items-center gap-2 ${
                      status === '1'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : status === '1' ? 'Approve & Credit' : 'Reject Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">Action Audit Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-xs font-semibold">Decision Status</span>
                    <span>{getStatusBadge(selectedItem.is_active)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-xs font-semibold">Approved Invoice ID</span>
                    <span className="font-mono text-zinc-300 font-semibold">{selectedItem.invoice_id || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-xs font-semibold">Action Date</span>
                    <span className="text-zinc-300">
                      {selectedItem.approve_date ? new Date(selectedItem.approve_date).toLocaleString() : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-500 text-xs font-semibold">Processed By</span>
                    <span className="text-zinc-300">Staff ID: {selectedItem.approved_by || '1'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2 border-t border-white/5 pt-2 mt-1">
                    <span className="text-zinc-500 text-xs font-semibold">Admin Reply Remarks</span>
                    <p className="text-zinc-300 italic">"{selectedItem.reply || 'No remarks provided.'}"</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
