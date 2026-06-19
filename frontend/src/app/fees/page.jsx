'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Search, X, Receipt, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FeesPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [collectingStudent, setCollectingStudent] = useState(null);
  const [viewingTransactions, setViewingTransactions] = useState(null);

  // Collect Fee form state
  const [selectedFeeCategory, setSelectedFeeCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('0');
  const [fine, setFine] = useState('0');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [savingDeposit, setSavingDeposit] = useState(false);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
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

  const loadFeesSheet = async () => {
    if (!selectedClass || !selectedSection) {
      showNotification('Please specify Class and Section', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/fees/student?class_id=${selectedClass}&section_id=${selectedSection}&session_id=21`);
      const json = await res.json();
      setStudentFees(json.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load student fees sheet', 'danger');
      setLoading(false);
    }
  };

  const getTotals = (fees) => {
    let totalDues = 0;
    let totalPaid = 0;
    fees?.forEach(feeList => {
      feeList?.forEach(f => {
        totalDues += parseFloat(f.amount || 0);
        if (f.amount_detail && f.amount_detail !== '0') {
          try {
            const txs = JSON.parse(f.amount_detail);
            Object.values(txs).forEach(tx => {
              totalPaid += parseFloat(tx.amount || 0);
            });
          } catch (e) {}
        }
      });
    });
    return {
      totalDues,
      totalPaid,
      balance: totalDues - totalPaid
    };
  };

  const handleOpenCollectModal = (student) => {
    setCollectingStudent(student);
    const firstFee = student.fees?.[0]?.[0];
    if (firstFee) {
      setSelectedFeeCategory(JSON.stringify({
        student_fees_master_id: firstFee.id,
        fee_groups_feetype_id: firstFee.fee_groups_feetype_id,
        amount: firstFee.amount
      }));
      setAmount(firstFee.amount);
    }
    setDiscount('0');
    setFine('0');
    setDescription('');
  };

  const handleFeeCategoryChange = (val) => {
    setSelectedFeeCategory(val);
    if (val) {
      const parsed = JSON.parse(val);
      setAmount(parsed.amount);
    }
  };

  const saveDeposit = async (e) => {
    e.preventDefault();
    if (!selectedFeeCategory) {
      showNotification('Please select a fee category', 'warning');
      return;
    }
    setSavingDeposit(true);
    try {
      const parsedCat = JSON.parse(selectedFeeCategory);
      const payload = {
        student_fees_master_id: parsedCat.student_fees_master_id,
        fee_groups_feetype_id: parsedCat.fee_groups_feetype_id,
        amount: parseFloat(amount),
        amount_discount: parseFloat(discount),
        amount_fine: parseFloat(fine),
        date: paymentDate,
        payment_mode: paymentMode,
        description: description,
        received_by: 1
      };

      const res = await fetch('/api/fees/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Fee payment received successfully', 'success');
        setCollectingStudent(null);
        loadFeesSheet();
      } else {
        showNotification(json.error?.message || 'Failed to record deposit', 'danger');
      }
    } catch (err) {
      console.error(err);
      showNotification('Network error saving fee deposit', 'danger');
    } finally {
      setSavingDeposit(false);
    }
  };

  const getTransactions = (student) => {
    const list = [];
    student.fees?.forEach(feeList => {
      feeList?.forEach(f => {
        if (f.amount_detail && f.amount_detail !== '0') {
          try {
            const txs = JSON.parse(f.amount_detail);
            Object.entries(txs).forEach(([invNo, tx]) => {
              list.push({
                feeType: f.type || 'Standard Fee',
                feeCode: f.code || '',
                invNo,
                amount: tx.amount,
                discount: tx.amount_discount || 0,
                fine: tx.amount_fine || 0,
                date: tx.date,
                mode: tx.payment_mode || 'Cash',
                desc: tx.description || ''
              });
            });
          } catch (e) {}
        }
      });
    });
    return list;
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Fees Desk</h2>
        <p className="text-zinc-400 text-sm">Track student invoice dues, collect payments, and audit payment receipts.</p>
      </div>

      {/* Class Section Filter bar */}
      <div className="glass-card flex flex-wrap gap-4 items-center">
        <div className="min-w-[160px]">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5 font-sans">Select Class</label>
          <Select
            value={selectedClass || "all"}
            onValueChange={(val) => {
              setSelectedClass(val === "all" ? "" : val);
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Choose Class</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[160px]">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Section</label>
          <Select
            value={selectedSection || "all"}
            onValueChange={(val) => setSelectedSection(val === "all" ? "" : val)}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="Choose Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Choose Section</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-[22px]">
          <button type="button" className="btn btn-primary h-[48px]" onClick={loadFeesSheet}>
            <Search size={16} /> Search Register
          </button>
        </div>
      </div>

      {/* Student fee dues list */}
      {studentFees.length > 0 && (
        <div className="glass-card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-400">Loading student fees ledger...</div>
          ) : (
            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Dues Allocated</th>
                    <th>Total Dues</th>
                    <th>Paid Amount</th>
                    <th>Remaining Dues</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFees.map(sf => {
                    const totals = getTotals(sf.fees);
                    const feeGroupNames = [...new Set(sf.fees?.flatMap(l => l?.map(f => f.name)) || [])];
                    return (
                      <tr key={sf.student_session_id}>
                        <td><span className="font-mono text-purple-400 font-semibold">{sf.admission_no}</span></td>
                        <td className="font-semibold text-white">{`${sf.firstname || ''} ${sf.middlename || ''} ${sf.lastname || ''}`.trim()}</td>
                        <td>
                          <div className="flex gap-1.5 flex-wrap">
                            {feeGroupNames.map((g, idx) => (
                              <span key={idx} className="badge-warning px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="font-medium">${totals.totalDues.toFixed(2)}</td>
                        <td className="text-emerald-400 font-medium">${totals.totalPaid.toFixed(2)}</td>
                        <td>
                          {totals.balance <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase">Fully Paid</span>
                          ) : (
                            <span className="text-rose-500 font-semibold">${totals.balance.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-secondary !px-3 !py-1.5 !text-xs"
                              onClick={() => setViewingTransactions(sf)}
                            >
                              <Receipt size={12} /> Receipts
                            </button>
                            {totals.balance > 0 && (
                              <button
                                type="button"
                                className="btn btn-primary !px-3 !py-1.5 !text-xs !from-emerald-500 !to-emerald-600"
                                onClick={() => handleOpenCollectModal(sf)}
                              >
                                <CreditCard size={12} /> Collect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Collect Fee Modal */}
      {collectingStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <form onSubmit={saveDeposit} className="glass-card w-full max-w-[500px] relative !p-8">
            <button
              type="button"
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
              onClick={() => setCollectingStudent(null)}
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Landmark size={22} className="text-emerald-400" /> Collect Student Fee
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block">Student Name</span>
                <p className="text-base font-semibold mt-1 text-white">
                  {`${collectingStudent.firstname || ''} ${collectingStudent.middlename || ''} ${collectingStudent.lastname || ''}`.trim()}
                </p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Select Fee Allocation Category</label>
                <Select
                  value={selectedFeeCategory ? String(selectedFeeCategory) : undefined}
                  onValueChange={(val) => handleFeeCategoryChange(val || '')}
                >
                  <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                    <SelectValue placeholder="Select Fee Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectingStudent.fees?.flatMap(l => l || [])?.map((f, idx) => {
                      const valStr = JSON.stringify({
                        student_fees_master_id: f.id,
                        fee_groups_feetype_id: f.fee_groups_feetype_id,
                        amount: f.amount
                      });
                      return (
                        <SelectItem key={idx} value={valStr}>
                          {`${f.fee_group_name || 'Standard'} - ${f.type || 'Fee'} ($${f.amount})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Amount to Pay ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Payment Mode</label>
                  <Select
                    value={paymentMode}
                    onValueChange={(val) => setPaymentMode(val)}
                  >
                    <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
                      <SelectValue placeholder="Payment Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Online">Online Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Fine ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={fine}
                    onChange={(e) => setFine(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Payment Date</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Remarks / Memo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Receipt number or deposit remarks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setCollectingStudent(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary !from-emerald-500 !to-emerald-600" disabled={savingDeposit}>
                <CheckCircle size={16} /> {savingDeposit ? 'Recording...' : 'Collect Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Transactions Modal */}
      {viewingTransactions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6">
          <div className="glass-card w-full max-w-[700px] relative overflow-y-auto max-h-[90vh] !p-8">
            <button
              type="button"
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
              onClick={() => setViewingTransactions(null)}
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <Receipt size={22} className="text-indigo-400" /> Transaction History
            </h3>

            <div className="mb-6">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider block">Student Ledger Account</span>
              <p className="text-base font-semibold mt-1 text-white">
                {`${viewingTransactions.firstname || ''} ${viewingTransactions.middlename || ''} ${viewingTransactions.lastname || ''}`.trim()}
              </p>
            </div>

            {getTransactions(viewingTransactions).length > 0 ? (
              <div className="table-container !mt-0 !border-white/5">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Fee Category</th>
                      <th>Paid Date</th>
                      <th>Method</th>
                      <th>Discount</th>
                      <th>Fine</th>
                      <th>Amount Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTransactions(viewingTransactions).map((tx, idx) => (
                      <tr key={idx}>
                        <td><span className="font-mono text-xs text-indigo-300">{`INV-${tx.invNo}`}</span></td>
                        <td>
                          <span className="font-medium text-white">{tx.feeType}</span>
                          <span className="text-[10px] text-zinc-500 block">{tx.feeCode}</span>
                        </td>
                        <td>{tx.date}</td>
                        <td>{tx.mode}</td>
                        <td>{tx.discount > 0 ? `$${tx.discount}` : '-'}</td>
                        <td>{tx.fine > 0 ? `$${tx.fine}` : '-'}</td>
                        <td className="text-emerald-400 font-semibold">${tx.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400">No payment receipts recorded for this account.</div>
            )}

            <div className="flex justify-end mt-6">
              <button type="button" className="btn btn-secondary" onClick={() => setViewingTransactions(null)}>Close Receipts</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
