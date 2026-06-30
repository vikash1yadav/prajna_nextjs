'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { CalendarRange, Search, CheckCircle, Save } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function StaffAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roleId, setRoleId] = useState('');

  // Fetch Roles
  const { data: rolesRes } = useSWR('/api/roles', fetcher);
  const roles = rolesRes?.data || [];

  // Fetch Staff list with their attendance state for chosen date/role
  const { data: attendanceRes, isLoading } = useSWR(
    date ? `/api/staff-attendance?date=${date}${roleId ? `&role_id=${roleId}` : ''}` : null,
    fetcher
  );
  const staffAttendance = attendanceRes?.data || [];

  // Local Attendance Input State
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync SWR result to local state map
  useEffect(() => {
    if (staffAttendance.length > 0) {
      const newMap = {};
      staffAttendance.forEach(item => {
        newMap[item.id] = {
          staff_attendance_type_id: item.staff_attendance_type_id || 1, // Default to Present (1)
          remark: item.remark || ''
        };
      });
      setAttendanceMap(newMap);
    }
  }, [staffAttendance]);

  const handleRadioChange = (staffId, val) => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        staff_attendance_type_id: parseInt(val)
      }
    }));
  };

  const handleRemarkChange = (staffId, val) => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        remark: val
      }
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      date,
      attendance: Object.keys(attendanceMap).map(staffId => ({
        staff_id: parseInt(staffId),
        staff_attendance_type_id: attendanceMap[staffId].staff_attendance_type_id,
        remark: attendanceMap[staffId].remark
      }))
    };

    try {
      const res = await fetch('/api/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Attendance marked successfully!' });
        mutate(date ? `/api/staff-attendance?date=${date}${roleId ? `&role_id=${roleId}` : ''}` : null);
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Server error occurred' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <CalendarRange size={28} /> Staff Attendance
        </h2>
        <p className="text-zinc-400 text-sm">Select a date and staff role, mark attendance, and add remarks.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-card border-white/5 flex flex-col md:flex-row gap-6 items-end p-5">
        <div className="form-group flex flex-col gap-1 w-full md:w-56">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Attendance Date *</label>
          <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="form-group flex flex-col gap-1 w-full md:w-56">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Staff Role</label>
          <select className="input-field" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-lg border text-sm ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Attendance marking area */}
      <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Attendance Register</h3>
          {staffAttendance.length > 0 && (
            <button 
              onClick={handleSave} 
              disabled={isSubmitting} 
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 flex items-center gap-2"
            >
              <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">Loading register...</div>
        ) : staffAttendance.length > 0 ? (
          <div className="table-container !mt-0 !border-none overflow-x-auto">
            <table className="data-table whitespace-nowrap">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Attendance Status</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {staffAttendance.map((staff) => {
                  const stateVal = attendanceMap[staff.id]?.staff_attendance_type_id || 1;
                  const remarkVal = attendanceMap[staff.id]?.remark || '';
                  return (
                    <tr key={staff.id} className="hover:bg-white/5 transition-colors">
                      <td className="font-mono text-xs text-zinc-400">{staff.employee_id}</td>
                      <td className="font-semibold text-white">{staff.firstname} {staff.lastname}</td>
                      <td className="text-zinc-400 text-sm">{staff.role_name}</td>
                      <td>
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                            <input 
                              type="radio" 
                              name={`attendance-${staff.id}`} 
                              value="1" 
                              checked={stateVal === 1}
                              onChange={(e) => handleRadioChange(staff.id, e.target.value)}
                              className="accent-emerald-500" 
                            />
                            Present
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                            <input 
                              type="radio" 
                              name={`attendance-${staff.id}`} 
                              value="2" 
                              checked={stateVal === 2}
                              onChange={(e) => handleRadioChange(staff.id, e.target.value)}
                              className="accent-amber-500" 
                            />
                            Late
                            </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                            <input 
                              type="radio" 
                              name={`attendance-${staff.id}`} 
                              value="3" 
                              checked={stateVal === 3}
                              onChange={(e) => handleRadioChange(staff.id, e.target.value)}
                              className="accent-rose-500" 
                            />
                            Absent
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                            <input 
                              type="radio" 
                              name={`attendance-${staff.id}`} 
                              value="4" 
                              checked={stateVal === 4}
                              onChange={(e) => handleRadioChange(staff.id, e.target.value)}
                              className="accent-sky-500" 
                            />
                            Half Day
                          </label>
                        </div>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="input-field !py-1 !text-xs w-64" 
                          placeholder="Note/Remark..." 
                          value={remarkVal} 
                          onChange={(e) => handleRemarkChange(staff.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">No staff found for this role query.</div>
        )}
      </div>
    </div>
  );
}
