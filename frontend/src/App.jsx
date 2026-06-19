import React, { useState } from 'react';
import { LayoutDashboard, Users, CalendarCheck, CalendarDays, Wallet, Menu } from 'lucide-react';

import Dashboard from './components/Dashboard.jsx';
import StudentsList from './components/StudentsList.jsx';
import AttendanceTracker from './components/AttendanceTracker.jsx';
import ExamScheduler from './components/ExamScheduler.jsx';
import FeesManagement from './components/FeesManagement.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentsList />;
      case 'attendance':
        return <AttendanceTracker addToast={addToast} />;
      case 'exams':
        return <ExamScheduler addToast={addToast} />;
      case 'fees':
        return <FeesManagement addToast={addToast} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">P</div>
          <h1 className="brand-title">Prajna ERP</h1>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={18} />
            <span>Students Registry</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheck size={18} />
            <span>Attendance Register</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <CalendarDays size={18} />
            <span>Exam Scheduler</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees')}
          >
            <Wallet size={18} />
            <span>Fees desk</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Session: 2025-26 (Active)</span>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Alert Toasts Layer */}
      <div className="toast-container">
        {toasts.map((t) => {
          let styleColor = 'var(--primary)';
          if (t.type === 'success') styleColor = 'var(--success)';
          if (t.type === 'danger') styleColor = 'var(--danger)';
          if (t.type === 'warning') styleColor = 'var(--warning)';
          return (
            <div key={t.id} className="toast" style={{ borderLeft: `4px solid ${styleColor}` }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
