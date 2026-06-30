'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Landmark, Search, DollarSign, CheckCircle2, AlertCircle, Eye, Calculator, Settings, ArrowLeft } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = ['2025', '2026', '2027', '2028'];

export default function PayrollPage() {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState('2026');
  const [roleId, setRoleId] = useState('');

  // SWR Fetches
  const { data: rolesRes } = useSWR('/api/roles', fetcher);
  const roles = rolesRes?.data || [];

  const queryKey = month && year ? `/api/payroll?month=${month}&year=${year}${roleId ? `&role_id=${roleId}` : ''}` : null;
  const { data: payrollRes, isLoading } = useSWR(queryKey, fetcher);
  const payrollList = payrollRes?.data || [];

  // Active View State
  const [activeStaff, setActiveStaff] = useState(null);
  const [activePayslip, setActivePayslip] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Generate Payslip Form State
  const [basic, setBasic] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [tax, setTax] = useState(0);
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pay Modal State
  const [paymentMode, setPaymentMode] = useState('Cash');

  const handleOpenGenerate = (staff) => {
    setActiveStaff(staff);
    setBasic(staff.basic_salary || 0);
    setAllowance(0);
    setDeduction(0);
    setTax(0);
    setRemark('');
    setShowGenerateForm(true);
  };

  const handleCalculateNet = () => {
    return parseFloat(basic) + parseFloat(allowance) - parseFloat(deduction) - parseFloat(tax);
  };

  const handleSavePayslip = async (e) => {
    e.preventDefault();
    if (!activeStaff) return;
    setIsSubmitting(true);

    const netSalary = handleCalculateNet();
    const payload = {
      staff_id: activeStaff.id,
      month,
      year,
      basic: parseFloat(basic),
      total_allowance: parseFloat(allowance),
      total_deduction: parseFloat(deduction),
      net_salary: netSalary,
      remark
    };

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        mutate(queryKey);
        setShowGenerateForm(false);
        setActiveStaff(null);
      } else {
        alert(data.message || 'Failed to save payslip');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPay = (item) => {
    setActivePayslip(item);
    setPaymentMode('Cash');
    setShowPayModal(true);
  };

  const handlePay = async () => {
    if (!activePayslip) return;
    setIsSubmitting(true);

    const payload = {
      id: activePayslip.payslip_id,
      staff_id: activePayslip.id,
      month,
      year,
      status: 'paid',
      payment_mode: paymentMode
    };

    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        mutate(queryKey);
        setShowPayModal(false);
        setActivePayslip(null);
      } else {
        alert(data.message || 'Failed to record payment');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <Landmark size={28} /> Payroll Management
        </h2>
        <p className="text-zinc-400 text-sm">Calculate allowances/deductions, generate payslips, and record payments.</p>
      </div>

      {showGenerateForm && activeStaff ? (
        // Payslip Calculator Form
        <div className="glass-card border-emerald-500/10 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calculator size={20} className="text-emerald-400" />
              Generate Payslip ({month} {year})
            </h3>
            <button onClick={() => { setShowGenerateForm(false); setActiveStaff(null); }} className="btn btn-secondary flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Directory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-300 border-b border-white/5 pb-6">
            <div>
              <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold">Staff Member</span>
              <span className="font-bold text-white text-base">{activeStaff.firstname} {activeStaff.lastname}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold">Employee ID</span>
              <span className="font-mono text-white text-base">{activeStaff.employee_id}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold">Role / Designation</span>
              <span className="text-white text-base">{activeStaff.role_name}</span>
            </div>
          </div>

          <form onSubmit={handleSavePayslip} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400">Basic Salary ($) *</label>
                <input type="number" className="input-field" value={basic} onChange={(e) => setBasic(e.target.value)} required />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400">Total Allowance ($)</label>
                <input type="number" className="input-field" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400">Total Deduction ($)</label>
                <input type="number" className="input-field" value={deduction} onChange={(e) => setDeduction(e.target.value)} />
              </div>
              <div className="form-group flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-400">Tax ($)</label>
                <input type="number" className="input-field" value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
            </div>

            <div className="form-group flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400">Remarks</label>
              <textarea className="input-field h-20" placeholder="Type comments/notes here..." value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex justify-between items-center mt-2">
              <div>
                <span className="text-xs text-emerald-400 uppercase tracking-wider block font-semibold">Calculated Net Salary</span>
                <span className="text-2xl font-bold text-white font-mono">${handleCalculateNet().toFixed(2)}</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 px-8 py-3">
                {isSubmitting ? 'Generating...' : 'Generate and Save Payslip'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Main Payroll Grid Search View
        <div className="flex flex-col gap-6">
          {/* Query Filter panel */}
          <div className="glass-card border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6 items-end p-5">
            <div className="form-group flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payroll Month *</label>
              <select className="input-field" value={month} onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payroll Year *</label>
              <select className="input-field" value={year} onChange={(e) => setYear(e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="form-group flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Staff Role</label>
              <select className="input-field" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Payroll Directory</h3>
              <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                Total: {payrollList.length}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">Loading payroll records...</div>
            ) : payrollList.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Basic Salary</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="font-semibold text-white">
                          <div>{item.firstname} {item.lastname}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.employee_id}</div>
                        </td>
                        <td className="text-zinc-400 text-sm">{item.role_name}</td>
                        <td className="text-zinc-300 font-mono">${item.basic_salary || '0.00'}</td>
                        <td className="text-white font-mono font-semibold">
                          {item.payslip_id ? `$${item.net_salary}` : 'N/A'}
                        </td>
                        <td>
                          {item.payslip_id ? (
                            item.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 size={12} /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertCircle size={12} /> Generated
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-zinc-500 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full">Un-generated</span>
                          )}
                        </td>
                        <td className="text-right flex justify-end gap-2 p-3">
                          {item.payslip_id ? (
                            item.status !== 'paid' && (
                              <button onClick={() => handleOpenPay(item)} className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 py-1 px-3 text-xs flex items-center gap-1.5">
                                <DollarSign size={14} /> Pay
                              </button>
                            )
                          ) : (
                            <button onClick={() => handleOpenGenerate(item)} className="btn btn-secondary hover:bg-white/10 py-1 px-3 text-xs flex items-center gap-1.5">
                              <Calculator size={14} /> Generate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">No records to show.</div>
            )}
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && activePayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md border-emerald-500/20 flex flex-col gap-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-white">Record Payroll Payment</h3>
              <p className="text-zinc-400 text-xs mt-1">Payment for {activePayslip.firstname} {activePayslip.lastname} ({month} {year})</p>
            </div>

            <div className="flex flex-col gap-4 text-sm text-zinc-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Net Salary Amount</span>
                <span className="font-bold text-white font-mono">${activePayslip.net_salary}</span>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Payment Mode</label>
                <select className="input-field" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-end border-t border-white/5 pt-4">
              <button type="button" onClick={() => setShowPayModal(false)} className="btn btn-secondary px-4 text-xs">
                Cancel
              </button>
              <button onClick={handlePay} disabled={isSubmitting} className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 px-6 text-xs">
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
