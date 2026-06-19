import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, AlertCircle, Save, CheckSquare, RefreshCw } from 'lucide-react';

export default function AttendanceTracker({ addToast }) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const typesRes = await fetch('/api/attendance/types');
        const typesJson = await typesRes.json();
        setAttendanceTypes(typesJson.data || []);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadData();
  }, []);

  // Fetch sections when class changes
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

  const loadRegister = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      addToast('Please specify Class, Section, and Date', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/search?class_id=${selectedClass}&section_id=${selectedSection}&date=${selectedDate}`);
      const json = await res.json();
      const list = json.data || [];
      // Initialize or map list
      const initialized = list.map(item => ({
        id: item.student_attendance_id || null,
        student_session_id: item.student_session_id,
        admission_no: item.admission_no,
        roll_no: item.roll_no,
        name: `${item.firstname || ''} ${item.middlename || ''} ${item.lastname || ''}`.trim(),
        attendence_type_id: item.attendence_type_id || 1, // Default to Present (usually 1)
        remark: item.remark || ''
      }));
      setAttendanceList(initialized);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load register', err);
      addToast('Failed to load class register', 'danger');
      setLoading(false);
    }
  };

  const handleTypeChange = (studentSessionId, typeId) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.student_session_id === studentSessionId) {
        return { ...item, attendence_type_id: parseInt(typeId) };
      }
      return item;
    }));
  };

  const handleRemarkChange = (studentSessionId, remark) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.student_session_id === studentSessionId) {
        return { ...item, remark };
      }
      return item;
    }));
  };

  const bulkSetAttendance = (typeId) => {
    setAttendanceList(prev => prev.map(item => ({
      ...item,
      attendence_type_id: parseInt(typeId)
    })));
    addToast(`Bulk set all students to ${attendanceTypes.find(t => t.id === parseInt(typeId))?.type || 'status'}`, 'info');
  };

  const saveRegister = async () => {
    setSubmitting(true);
    try {
      const payload = attendanceList.map(item => ({
        id: item.id,
        student_session_id: item.student_session_id,
        attendence_type_id: item.attendence_type_id,
        date: selectedDate,
        remark: item.remark
      }));

      const res = await fetch('/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances: payload })
      });
      const json = await res.json();
      if (json.success) {
        addToast('Attendance sheet saved successfully', 'success');
        loadRegister();
      } else {
        addToast(json.error?.message || 'Failed to save attendance sheet', 'danger');
      }
    } catch (err) {
      console.error('Failed saving attendance', err);
      addToast('Network error while saving attendance', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Daily Attendance Register</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Search and record daily student presence records.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ minWidth: '150px' }}>
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

        <div style={{ minWidth: '150px' }}>
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

        <div style={{ minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Select Date</label>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div style={{ paddingTop: '1.25rem' }}>
          <button className="btn btn-primary" onClick={loadRegister} style={{ height: '42px' }}>
            <RefreshCw size={16} /> Load Sheet
          </button>
        </div>
      </div>

      {attendanceList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Bulk Action Panel */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={18} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Bulk Actions:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {attendanceTypes.map(t => (
                <button
                  key={t.id}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => bulkSetAttendance(t.id)}
                >
                  Mark All {t.type}
                </button>
              ))}
            </div>
          </div>

          {/* Student Dues Register Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>Loading student list...</div>
            ) : (
              <div className="table-container" style={{ margin: 0, border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm. No</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Status Mapping</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList.map(st => (
                      <tr key={st.student_session_id}>
                        <td><span style={{ fontFamily: 'monospace', color: '#8b5cf6', fontWeight: 600 }}>{st.admission_no}</span></td>
                        <td>{st.roll_no || 'N/A'}</td>
                        <td style={{ fontWeight: 500 }}>{st.name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {attendanceTypes.map(t => {
                              const isChecked = st.attendence_type_id === t.id;
                              let labelStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' };
                              let pillStyle = { width: '14px', height: '14px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' };
                              if (isChecked) {
                                if (t.id === 1) pillStyle.background = '#10b981'; // Present
                                if (t.id === 2) pillStyle.background = '#f43f5e'; // Absent
                                if (t.id === 3) pillStyle.background = '#f59e0b'; // Late
                                if (t.id === 4) pillStyle.background = '#6366f1'; // Holiday
                              }
                              return (
                                <label key={t.id} style={labelStyle}>
                                  <input
                                    type="radio"
                                    name={`attendance_${st.student_session_id}`}
                                    style={{ display: 'none' }}
                                    checked={isChecked}
                                    onChange={() => handleTypeChange(st.student_session_id, t.id)}
                                  />
                                  <span style={pillStyle}></span>
                                  <span style={{ color: isChecked ? '#fff' : '#a1a1aa', fontWeight: isChecked ? 600 : 400 }}>{t.type}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="input-field"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: 'transparent' }}
                            placeholder="Enter remarks..."
                            value={st.remark}
                            onChange={(e) => handleRemarkChange(st.student_session_id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={saveRegister} disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving Sheet...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
