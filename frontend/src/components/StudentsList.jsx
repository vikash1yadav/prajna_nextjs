import React, { useState, useEffect } from 'react';
import { Search, User, Filter, X, ShieldAlert } from 'lucide-react';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const classesRes = await fetch('/api/classes');
        const classesJson = await classesRes.json();
        setClasses(classesJson.data || []);

        const studentsRes = await fetch('/api/students');
        const studentsJson = await studentsRes.json();
        setStudents(studentsJson.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load initial students data', err);
        setLoading(false);
      }
    }
    loadInitialData();
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

  // Handle Search & Filter submit
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = '/api/students?';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedClass) params.push(`class_id=${selectedClass}`);
      if (selectedSection) params.push(`section_id=${selectedSection}`);
      
      const res = await fetch(url + params.join('&'));
      const json = await res.json();
      setStudents(json.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed search query', err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Students Registry</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>Search, filter, and view detailed profiles of active student accounts.</p>
      </div>

      {/* Search Bar & Filters Form */}
      <form onSubmit={handleSearch} className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by name, roll no, admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            className="input-field"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.class}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <select
            className="input-field"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.section}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
          <Filter size={16} /> Filter
        </button>
      </form>

      {/* Students List Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlignment: 'center', color: '#a1a1aa' }}>Loading students list...</div>
        ) : students.length > 0 ? (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Mobile</th>
                  <th>Guardian</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td><span style={{ fontFamily: 'monospace', color: '#8b5cf6', fontWeight: 600 }}>{st.admission_no}</span></td>
                    <td>{st.roll_no || 'N/A'}</td>
                    <td style={{ fontWeight: 500 }}>
                      {`${st.firstname || ''} ${st.middlename || ''} ${st.lastname || ''}`.trim()}
                    </td>
                    <td>{st.class}</td>
                    <td>{st.section}</td>
                    <td>{st.mobileno || 'N/A'}</td>
                    <td>{st.guardian_name || 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedStudent(st)}
                      >
                        <User size={12} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>No student records match the filters.</div>
        )}
      </div>

      {/* Modal Profile Viewer */}
      {selectedStudent && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <button
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              onClick={() => setSelectedStudent(null)}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: '#6366f1' }} /> Student Profile Detail
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Full Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {`${selectedStudent.firstname || ''} ${selectedStudent.middlename || ''} ${selectedStudent.lastname || ''}`.trim()}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Admission Number</span>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: '#8b5cf6' }}>{selectedStudent.admission_no}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Gender</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{selectedStudent.gender || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Date of Birth</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{selectedStudent.dob || 'N/A'}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Father Name</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{selectedStudent.father_name || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Guardian Detail</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{selectedStudent.guardian_name} ({selectedStudent.guardian_relation || 'Guardian'})</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Guardian Phone</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{selectedStudent.guardian_phone || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>National ID (Adhar / Samagra)</span>
                <p style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>Adhar: {selectedStudent.adhar_no || 'N/A'} / Samagra: {selectedStudent.samagra_id || 'N/A'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Bank Account Credentials</span>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Bank Name</span>
                  <p style={{ fontSize: '0.85rem' }}>{selectedStudent.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Account No</span>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedStudent.bank_account_no || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#71717a' }}>IFSC Code</span>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{selectedStudent.ifsc_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
