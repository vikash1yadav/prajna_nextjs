'use client';

import React, { useState, useRef } from 'react';
import { Search, Receipt, Printer, X, CreditCard, Calendar, User, DollarSign, Tag, CheckCircle } from 'lucide-react';

export default function SearchPaymentPage() {
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!paymentId.trim()) return;

    setLoading(true);
    setError(null);
    setPayment(null);

    try {
      const res = await fetch(`/api/fees/payments/search?payment_id=${encodeURIComponent(paymentId.trim())}`);
      const data = await res.json();

      if (data.success && data.data) {
        setPayment(data.data);
      } else {
        setError(data.error || 'Payment transaction receipt not found. Make sure the Payment ID matches the pattern "invoice_id/sub_invoice_id" (e.g. 1/1).');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple window printing helper
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${paymentId}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; }
            .receipt-header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
            .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .receipt-meta { font-size: 14px; color: #6b7280; }
            .receipt-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; font-size: 14px; }
            .label { font-weight: 600; color: #4b5563; }
            .value { margin-top: 2px; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            .details-table th, .details-table td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            .details-table th { background-color: #f9fafb; font-weight: 600; }
            .amount-summary { margin-left: auto; width: 300px; margin-top: 30px; border-top: 2px solid #e5e7eb; padding-top: 15px; font-size: 14px; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 1px dashed #e5e7eb; padding-top: 10px; margin-top: 5px; }
            .signature { margin-top: 60px; text-align: right; font-size: 14px; font-style: italic; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <Receipt size={28} /> Search Fees Payment
        </h2>
        <p className="text-zinc-400 text-sm">Enter a payment transaction reference code to generate a copy of the student fee deposit invoice receipt.</p>
      </div>

      {/* Search Input Card */}
      <div className="glass-card max-w-xl border-indigo-500/10">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="form-group flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Payment ID / Invoice ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Enter reference (e.g. 1/1, 2/1)..."
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                disabled={loading}
                required
              />
              <Receipt size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 self-end h-[46px] px-6 flex items-center gap-2"
          >
            <Search size={18} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Error Info */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-xl flex items-start gap-3">
          <X size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Receipt View */}
      {payment && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-end gap-3 max-w-3xl">
            <button
              onClick={handlePrint}
              className="btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/15"
            >
              <Printer size={16} /> Print Receipt
            </button>
          </div>

          <div className="glass-card max-w-3xl border-indigo-500/15 relative overflow-hidden" ref={printRef}>
            {/* Background design accents for digital preview */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -z-10" />

            <div className="receipt-header border-b border-white/5 pb-6 mb-6">
              <h3 className="receipt-title text-2xl font-bold text-white text-center">PRAJNA INSTITUTIONS ERP</h3>
              <p className="receipt-meta text-xs text-zinc-400 text-center uppercase tracking-wider mt-1">
                Student Fee Transaction Invoice Receipt
              </p>
            </div>

            {/* Receipt metadata details */}
            <div className="receipt-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Payment Reference ID</span>
                <span className="value font-mono text-indigo-400 font-bold text-base">{paymentId}</span>
              </div>
              <div className="flex flex-col gap-0.5 md:text-right">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Transaction Date</span>
                <span className="value text-zinc-300 flex items-center md:justify-end gap-1.5">
                  <Calendar size={14} /> {payment.transaction?.date ? new Date(payment.transaction.date).toLocaleDateString() : '-'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 border-t border-white/5 pt-3 mt-1">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Student Name</span>
                <span className="value text-white font-medium flex items-center gap-1.5">
                  <User size={14} className="text-zinc-400" />
                  {`${payment.firstname || ''} ${payment.middlename || ''} ${payment.lastname || ''}`.trim()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 md:text-right border-t border-white/5 pt-3 mt-1">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Admission Number</span>
                <span className="value text-zinc-300 font-mono">{payment.admission_no || '-'}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Class (Section)</span>
                <span className="value text-zinc-300">{payment.class} ({payment.section})</span>
              </div>
              <div className="flex flex-col gap-0.5 md:text-right">
                <span className="label text-zinc-400 text-xs font-semibold uppercase tracking-wider">Payment Mode</span>
                <span className="value text-zinc-300 flex items-center md:justify-end gap-1.5">
                  <CreditCard size={14} /> {payment.transaction?.payment_mode || 'Cash'}
                </span>
              </div>
            </div>

            {/* Table detail list */}
            <div className="overflow-x-auto">
              <table className="details-table w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase text-xs tracking-wider">
                    <th className="py-3 px-1 text-left">Fee Category (Group)</th>
                    <th className="py-3 px-1 text-left">Fee Code</th>
                    <th className="py-3 px-1 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 text-zinc-300">
                    <td className="py-4 px-1">
                      <span className="font-semibold text-white">{payment.fee_type_name || 'Transport Fees'}</span>
                      <div className="text-xs text-zinc-500 font-normal">{payment.fee_group_name || ''}</div>
                    </td>
                    <td className="py-4 px-1 font-mono text-zinc-400 text-xs uppercase">
                      {payment.fee_type_code || 'N/A'}
                    </td>
                    <td className="py-4 px-1 text-right font-semibold text-white">
                      ₹{parseFloat(payment.transaction?.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total summary breakdown */}
            <div className="amount-summary border-t border-white/10 pt-4 mt-6 max-w-sm ml-auto text-sm">
              <div className="summary-row flex justify-between py-1 text-zinc-400">
                <span>Base Fee Paid</span>
                <span className="text-zinc-200">₹{parseFloat(payment.transaction?.amount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row flex justify-between py-1 text-zinc-400">
                <span>Discount Applied</span>
                <span className="text-emerald-400">- ₹{parseFloat(payment.transaction?.amount_discount || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row flex justify-between py-1 text-zinc-400">
                <span>Fine Charged</span>
                <span className="text-rose-400">+ ₹{parseFloat(payment.transaction?.amount_fine || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row grand-total flex justify-between py-2.5 border-t border-dashed border-white/10 font-bold text-white text-base">
                <span>Grand Net Paid</span>
                <span className="text-indigo-400">
                  ₹{(
                    parseFloat(payment.transaction?.amount || 0) -
                    parseFloat(payment.transaction?.amount_discount || 0) +
                    parseFloat(payment.transaction?.amount_fine || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Note details */}
            {payment.transaction?.description && (
              <div className="mt-8 text-xs bg-white/5 p-3 rounded-lg border border-white/5 text-zinc-400 italic">
                <span className="font-semibold not-italic block text-zinc-300 text-xs mb-0.5">Transaction Remarks:</span>
                "{payment.transaction.description}"
              </div>
            )}

            {/* Signature Area */}
            <div className="signature text-right mt-12 text-zinc-500 text-xs border-t border-white/5 pt-4">
              Authorized Signature, Received & Confirmed by staff ID: {payment.transaction?.received_by || '1'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
