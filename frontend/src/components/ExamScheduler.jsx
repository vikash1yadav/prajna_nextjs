import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, AlertTriangle, Plus, ListFilter, ClipboardList } from 'lucide-react';

export default function ExamScheduler({ addToast }) {
  const [exams, setExams] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const examsRes = await fetch('/api/exams');
        const examsJson = await examsRes.json();
        setExams(examsJson.data || []);

        const groupsRes = await fetch('/api/exams/groups');
        const groupsJson = await groupsRes.json();
        setExamGroups(groupsJson.data || []);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load exams', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const loadSchedules = async () => {
    if (!selectedExam) return;
    setScheduleLoading(true);
    try {
      const res = await fetch(`/api/exams/schedules?exam_id=${selectedExam}`);
      const json = await res.json();
      setSchedules(json.data || []);
      setScheduleLoading(false);
    } catch (err) {
      console.error('Failed loading schedules', err);
      addToast('Failed to load exam schedules', 'danger');
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExam) {
      loadSchedules();
    } else {
      setSchedules([]);
    }
  }, [selectedExam]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Exam Timetables & Schedules</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Manage academic examinations, subject schedules, and grading standards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Exam Selection Glass Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListFilter size={18} style={{ color: '#6366f1' }} /> Exam Parameters
          </h3>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Exam Group</label>
            <select
              className="input-field"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedExam('');
              }}
            >
              <option value="">-- Choose Exam Group --</option>
              {examGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem' }}>Select Exam</label>
            <select
              className="input-field"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={!selectedGroup}
            >
              <option value="">-- Choose Exam --</option>
              {exams
                .filter(e => e.exam_group_id === parseInt(selectedGroup))
                .map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
            </select>
          </div>

          {selectedExam && (
            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Clock size={16} style={{ color: '#6366f1', marginTop: '0.2rem' }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Examination ID: {selectedExam}</span>
                <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Showing scheduled subject examinations and locations.</p>
              </div>
            </div>
          )}
        </div>

        {/* Timetable schedule display */}
        <div className="glass-card" style={{ flexGrow: 2, padding: selectedExam ? '1.75rem' : '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: selectedExam ? 'flex-start' : 'center', alignItems: selectedExam ? 'stretch' : 'center', minHeight: '300px' }}>
          {selectedExam ? (
            <>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={18} style={{ color: '#6366f1' }} /> Scheduled Timetable
              </h3>

              {scheduleLoading ? (
                <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '2rem' }}>Loading schedules...</div>
              ) : schedules.length > 0 ? (
                <div className="table-container" style={{ border: 'none', margin: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Date</th>
                        <th>Time</th>
                        <th>Duration</th>
                        <th>Room</th>
                        <th>Max/Min Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map(sch => (
                        <tr key={sch.id}>
                          <td style={{ fontWeight: 600 }}>{sch.subject_name || 'N/A'}</td>
                          <td>{sch.date_of_exam || 'N/A'}</td>
                          <td>{sch.start_time || 'N/A'}</td>
                          <td>{sch.duration ? `${sch.duration} min` : 'N/A'}</td>
                          <td><span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Room {sch.room_no || 'N/A'}</span></td>
                          <td>{sch.max_marks || '0'} / {sch.min_marks || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 1rem', color: '#71717a' }}>
                  <AlertTriangle size={36} />
                  <span>No timetable schedules mapped to this examination yet.</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#71717a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={48} style={{ strokeWidth: 1.5 }} />
              <span>Select an Exam from the left panel to load the schedule register.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
