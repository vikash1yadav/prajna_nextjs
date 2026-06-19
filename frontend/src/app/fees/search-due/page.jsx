'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, FileText, Download, User, Info, Landmark, Calendar, ChevronDown, CheckSquare, Square } from 'lucide-react';

export default function SearchDuePage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [masters, setMasters] = useState([]);

  // Filters State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMasters, setSelectedMasters] = useState([]); // Array of checked master IDs
  const [isMasterDropdownOpen, setIsMasterDropdownOpen] = useState(false);

  // Results State
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const resClasses = await fetch('/api/classes');
        const jsonClasses = await resClasses.json();
        setClasses(jsonClasses.data || []);

        const resMasters = await fetch('/api/fees/masters?session_id=21');
        const jsonMasters = await resMasters.json();
        setMasters(jsonMasters.data || []);
      } catch (err) {
        console.error('Failed to load classes or master configurations', err);
      }
    }
    loadInitialData();
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

  const handleToggleMaster = (id) => {
    if (selectedMasters.includes(id)) {
      setSelectedMasters(selectedMasters.filter(mId => mId !== id));
    } else {
      setSelectedMasters([...selectedMasters, id]);
    }
  };

  const handleSelectAllMasters = () => {
    if (selectedMasters.length === masters.length) {
      setSelectedMasters([]);
    } else {
      setSelectedMasters(masters.map(m => m.id));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (selectedMasters.length === 0) {
      alert('Please check at least one Fee Category/Master');
      return;
    }

    setLoading(true);
    setSearched(true);
    setError(null);
    setResults([]);

    try {
      const classQuery = selectedClass ? `&class_id=${selectedClass}` : '';
      const sectionQuery = selectedSection ? `&section_id=${selectedSection}` : '';
      const mastersQuery = `&fee_groups=${selectedMasters.join(',')}`;

      const res = await fetch(`/api/fees/due-fees?session_id=21${classQuery}${sectionQuery}${mastersQuery}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'Failed to search dues');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Student Name', 'Admission No', 'Roll No', 'Class', 'Section', 'Fee Group', 'Fee Type', 'Due Date', 'Amount (₹)', 'Paid (₹)', 'Discount (₹)', 'Balance Dues (₹)'];
    const rows = results.map(r => [
      r.firstname + ' ' + (r.middlename ? r.middlename + ' ' : '') + r.lastname,
      r.admission_no || '',
      r.roll_no || '',
      r.class || '',
      r.section || '',
      r.fee_group || '',
      r.fee_type || '',
      r.due_date || '',
      r.amount.toFixed(2),
      r.deposited.toFixed(2),
      r.discount.toFixed(2),
      r.balance.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `due_fees_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDuesSummary = () => {
    const totalDues = results.reduce((sum, r) => sum + r.balance, 0);
    const totalCount = results.length;
    return { totalDues, totalCount };
  };

  const { totalDues, totalCount } = getDuesSummary();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <Search size={28} /> Search Due Fees
        </h2>
        <p className="text-zinc-400 text-sm">Query and identify students with outstanding balance dues in specific fee configurations.</p>
      </div>

      {/* Filter Form Card */}
      <div className="glass-card border-indigo-500/10">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Class</label>
            <select
              className="input-field py-2.5"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Section</label>
            <select
              className="input-field py-2.5"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={loading || !selectedClass}
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.section}
                </option>
              ))}
            </select>
          </div>

          {/* Multiselect Custom Dropdown for Masters */}
          <div className="form-group flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Fee Master Items <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsMasterDropdownOpen(!isMasterDropdownOpen)}
              className="input-field py-2.5 px-3 flex justify-between items-center text-left text-zinc-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="truncate">
                {selectedMasters.length === 0
                  ? 'Select Fee Types...'
                  : selectedMasters.length === masters.length
                  ? 'All Fee Types Selected'
                  : `${selectedMasters.length} Selected`}
              </span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isMasterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMasterDropdownOpen && (
              <div className="absolute top-[102%] left-0 right-0 z-30 max-h-[220px] overflow-y-auto bg-[#18181b]/95 border border-zinc-700/50 rounded-lg shadow-xl p-2.5 flex flex-col gap-1 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={handleSelectAllMasters}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-indigo-400 hover:bg-white/5 text-left font-semibold border-b border-white/5 mb-1"
                >
                  {selectedMasters.length === masters.length ? <CheckSquare size={14} /> : <Square size={14} />}
                  Toggle Select All
                </button>
                {masters.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer text-xs text-zinc-300 hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMasters.includes(item.id)}
                      onChange={() => handleToggleMaster(item.id)}
                      className="rounded border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                    />
                    <span className="truncate">
                      {item.fee_type_name} ({item.fee_group_name}) - ₹{parseFloat(item.amount).toFixed(0)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 h-[46px] flex items-center justify-center gap-2"
          >
            <Search size={18} /> {loading ? 'Searching...' : 'Search Due Fees'}
          </button>
        </form>
      </div>

      {/* Error Info */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {searched && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {results.length > 0 && (
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-zinc-500 text-xs font-semibold block uppercase">Unpaid Student Records</span>
                  <span className="text-white font-bold text-lg font-mono">{totalCount}</span>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <span className="text-zinc-500 text-xs font-semibold block uppercase">Total Dues Balance</span>
                  <span className="text-indigo-400 font-bold text-lg">₹{totalDues.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleExport}
                className="btn bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
          )}

          <div className="glass-card !p-0 overflow-hidden border-indigo-500/10">
            {loading ? (
              <div className="p-12 text-center text-zinc-400 animate-pulse">
                Querying outstanding balance details...
              </div>
            ) : results.length > 0 ? (
              <div className="table-container !mt-0 !border-none overflow-x-auto">
                <table className="data-table whitespace-nowrap">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Admission No</th>
                      <th>Class (Section)</th>
                      <th>Fee Category (Group)</th>
                      <th>Due Date</th>
                      <th>Total Amt (₹)</th>
                      <th>Paid (₹)</th>
                      <th>Discount (₹)</th>
                      <th>Balance Dues (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="font-medium text-white">{item.firstname} {item.lastname}</td>
                        <td className="font-mono text-zinc-400 text-sm">{item.admission_no}</td>
                        <td className="text-zinc-300 text-sm">{item.class} ({item.section})</td>
                        <td className="text-zinc-300 text-sm">
                          <span className="font-semibold text-white">{item.fee_type}</span>
                          <span className="text-xs text-zinc-500 block font-mono">{item.fee_group}</span>
                        </td>
                        <td className="text-zinc-400 text-sm">{item.due_date || '-'}</td>
                        <td className="text-zinc-300 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
                        <td className="text-emerald-400 text-sm">₹{item.deposited.toFixed(2)}</td>
                        <td className="text-zinc-400 text-sm">₹{item.discount.toFixed(2)}</td>
                        <td className="text-rose-400 text-sm font-bold">₹{item.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No student accounts found with unpaid balance dues under selected parameters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
