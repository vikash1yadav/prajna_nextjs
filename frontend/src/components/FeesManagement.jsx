import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Calendar, User, Search, RefreshCw, X, Receipt, CheckCircle } from 'lucide-react';

export default function FeesManagement({ addToast }) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(false);

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
      addToast('Please specify Class and Section', 'warning');
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
      addToast('Failed to load student fees sheet', 'danger');
      setLoading(false);
    }
  };

  // Calculations helper
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
    // Auto-select first available fee category
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
      addToast('Please select a fee category', 'warning');
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
        received_by: 1 // Default Super Admin ID
      };

      const res = await fetch('/api/fees/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        addToast('Fee payment received successfully', 'success');
        setCollectingStudent(null);
        loadFeesSheet();
      } else {
        addToast(json.error?.message || 'Failed to record deposit', 'danger');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error saving fee deposit', 'danger');
    } finally {
      setSavingDeposit(false);
    }
  };

  // Gather transactions list
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Fees Desk</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Track student invoice dues, collect payments, and audit payment receipts.</p>
      </div>

      {/* Class Section Filter bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ minWidth: '160px' }}>
          <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Select Class</label>
          <select
            className="input-field"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.class}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '160px' }}>
          <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Select Section</label>
          <select
            className="input-field"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">-- Choose Section --</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.section}</option>
            ))}
          </select>
        </div>

        <div style={{ paddingTop: '1.25rem' }}>
          <button className="btn btn-primary" onClick={loadFeesSheet} style={{ height: '42px' }}>
            <Search size={16} /> Search Register
          </button>
        </div>
      </div>

      {/* Student fee dues list */}
      {studentFees.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>Loading student fees ledger...</div>
          ) : (
            <div className="table-container" style={{ border: 'none', margin: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Dues Allocated</th>
                    <th>Total Dues</th>
                    <th>Paid Amount</th>
                    <th>Remaining Dues</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFees.map(sf => {
                    const totals = getTotals(sf.fees);
                    const feeGroupNames = [...new Set(sf.fees?.flatMap(l => l?.map(f => f.name)) || [])];
                    return (
                      <tr key={sf.student_session_id}>
                        <td><span style={{ fontFamily: 'monospace', color: '#8b5cf6', fontWeight: 600 }}>{sf.admission_no}</span></td>
                        <td style={{ fontWeight: 600 }}>{`${sf.firstname || ''} ${sf.middlename || ''} ${sf.lastname || ''}`.trim()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {feeGroupNames.map((g, idx) => (
                              <span key={idx} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{g}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>${totals.totalDues.toFixed(2)}</td>
                        <td style={{ color: '#10b981', fontWeight: 500 }}>${totals.totalPaid.toFixed(2)}</td>
                        <td>
                          {totals.balance <= 0 ? (
                            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Fully Paid</span>
                          ) : (
                            <span style={{ color: '#f43f5e', fontWeight: 600 }}>${totals.balance.toFixed(2)}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => setViewingTransactions(sf)}
                            >
                              <Receipt size={12} /> Receipts
                            </button>
                            {totals.balance > 0 && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
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
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <form onSubmit={saveDeposit} className="glass-card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button
              type="button"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              onClick={() => setCollectingStudent(null)}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark size={20} style={{ color: '#10b981' }} /> Collect Student Fee
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Student Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {`${collectingStudent.firstname || ''} ${collectingStudent.middlename || ''} ${collectingStudent.lastname || ''}`.trim()}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Select Fee Allocation Category</label>
                <select
                  className="input-field"
                  value={selectedFeeCategory}
                  onChange={(e) => handleFeeCategoryChange(e.target.value)}
                >
                  {collectingStudent.fees?.flatMap(l => l || [])?.map((f, idx) => (
                    <option key={idx} value={JSON.stringify({
                      student_fees_master_id: f.id,
                      fee_groups_feetype_id: f.fee_groups_feetype_id,
                      amount: f.amount
                    })}>
                      {`${f.fee_group_name || 'Standard'} - ${f.type || 'Fee'} ($${f.amount})`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Amount to Pay ($)</label>
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
                  <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Payment Mode</label>
                  <select
                    className="input-field"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online Transfer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Fine ($)</label>
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
                <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Payment Date</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Remarks / Memo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Receipt number or deposit remarks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCollectingStudent(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} disabled={savingDeposit}>
                <CheckCircle size={16} /> {savingDeposit ? 'Recording...' : 'Collect Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Transactions Modal */}
      {viewingTransactions && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '700px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <button
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              onClick={() => setViewingTransactions(null)}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} style={{ color: '#6366f1' }} /> Transaction History
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Student Ledger Account</span>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                {`${viewingTransactions.firstname || ''} ${viewingTransactions.middlename || ''} ${viewingTransactions.lastname || ''}`.trim()}
              </p>
            </div>

            {getTransactions(viewingTransactions).length > 0 ? (
              <div className="table-container" style={{ margin: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
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
                        <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{`INV-${tx.invNo}`}</span></td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{tx.feeType}</span>
                          <span style={{ fontSize: '0.7rem', color: '#a1a1aa', display: 'block' }}>{tx.feeCode}</span>
                        </td>
                        <td>{tx.date}</td>
                        <td>{tx.mode}</td>
                        <td>{tx.discount > 0 ? `$${tx.discount}` : '-'}</td>
                        <td>{tx.fine > 0 ? `$${tx.fine}` : '-'}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>${tx.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>No payment receipts recorded for this account.</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewingTransactions(null)}>Close Receipts</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
