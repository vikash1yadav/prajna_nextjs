'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Search, Filter, Trash2, CheckCircle, Clock, CheckSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function OnlineAdmissionPage() {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [queryUrl, setQueryUrl] = useState('/api/online-admissions');

  // SWR Data Fetching
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  const { data: sectionsData } = useSWR(selectedClass ? `/api/classes/${selectedClass}/sections` : null, fetcher);
  const sections = sectionsData?.data || [];

  const { data: admissionsData, isLoading, mutate } = useSWR(queryUrl, fetcher);
  const admissions = admissionsData?.data || [];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    let url = '/api/online-admissions?';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (selectedClass) params.push(`class_id=${selectedClass}`);
    if (selectedSection) params.push(`section_id=${selectedSection}`);
    
    setQueryUrl(url + params.join('&'));
  };

  const handleEnroll = async (id) => {
    if (!confirm('Are you sure you want to enroll this student? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/online-admissions/${id}/enroll`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        alert('Student successfully enrolled! Reference ID: ' + json.student_id);
        mutate();
      } else {
        alert('Failed to enroll student: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Enroll error', err);
      alert('Error connecting to backend API');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this online admission record?')) return;
    try {
      const res = await fetch(`/api/online-admissions/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert('Record deleted successfully!');
        mutate();
      } else {
        alert('Failed to delete record: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('Error connecting to backend API');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Online Admission</h2>
          <p className="text-zinc-400 text-sm">Review, manage, and enroll students who have applied online.</p>
        </div>
      </div>

      {/* Search Bar & Filters Form */}
      <form onSubmit={handleSearch} className="glass-card flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow min-w-[240px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, reference no, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="min-w-[150px]">
          <Select
            value={selectedClass || "all"}
            onValueChange={(val) => {
              setSelectedClass(val === "all" ? "" : val);
              setSelectedSection('');
            }}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <Select
            value={selectedSection || "all"}
            onValueChange={(val) => setSelectedSection(val === "all" ? "" : val)}
            disabled={!selectedClass}
          >
            <SelectTrigger className="w-full !bg-white/5 !border-white/5 !h-[45px] !px-4 !text-zinc-200 !rounded-lg flex justify-between items-center">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button type="submit" className="btn btn-primary h-[48px]">
          <Filter size={16} /> Filter
        </button>
      </form>

      {/* Admissions List Table */}
      <div className="glass-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">Loading online admissions...</div>
        ) : admissions.length > 0 ? (
          <div className="table-container !mt-0 !border-none overflow-x-auto">
            <table className="data-table whitespace-nowrap">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Student Name</th>
                  <th>Class/Sec</th>
                  <th>Father Name</th>
                  <th>DOB</th>
                  <th>Mobile</th>
                  <th>Form Status</th>
                  <th>Payment</th>
                  <th>Enrolled</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm) => (
                  <tr key={adm.id} className={adm.is_enroll === 1 ? "opacity-60" : ""}>
                    <td className="font-mono text-zinc-300">{adm.reference_no}</td>
                    <td className="font-medium text-emerald-400">
                      {[adm.firstname, adm.middlename, adm.lastname].filter(Boolean).join(' ')}
                    </td>
                    <td>
                      {adm.class ? `${adm.class} (${adm.section || '-'})` : '-'}
                    </td>
                    <td>{adm.father_name || '-'}</td>
                    <td>{adm.dob || '-'}</td>
                    <td>{adm.mobileno || '-'}</td>
                    <td>
                      {adm.form_status === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      {adm.paid_status === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Paid
                        </span>
                      ) : adm.paid_status === 2 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td>
                      {adm.is_enroll === 1 ? (
                        <span className="text-emerald-500"><CheckCircle size={20} /></span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {adm.is_enroll !== 1 && (
                          <button
                            onClick={() => handleEnroll(adm.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="Enroll Student"
                          >
                            <CheckSquare size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(adm.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400">
            No online admissions found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
