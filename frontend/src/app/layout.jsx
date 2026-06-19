'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import Link from 'next/link';
import LoginPage from './login/page.jsx';
import { LogOut, User, ChevronDown, ChevronRight, Users, Briefcase, CreditCard, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';


export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isStudentInfoOpen, setIsStudentInfoOpen] = useState(false);
  const [isFrontOfficeOpen, setIsFrontOfficeOpen] = useState(false);
  const [isFeesCollectionOpen, setIsFeesCollectionOpen] = useState(false);
  const [isExaminationsOpen, setIsExaminationsOpen] = useState(false);

  useEffect(() => {
    // Check if token and user exist in storage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setCheckingSession(false);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  if (checkingSession) {
    return (
      <html lang="en" className="dark font-sans">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="bg-[#09090b] text-white flex items-center justify-center min-h-screen">
          <div className="text-zinc-500 text-sm">Verifying session...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {!user ? (
          <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
        ) : (
          <div className="flex min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.05)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(168,85,247,0.05)_0%,transparent_40%),#09090b]">
            {/* Sidebar Navigation */}
            <aside className="w-[260px] bg-zinc-950/70 border-r border-white/5 backdrop-blur-xl flex flex-col p-6 h-screen sticky top-0">
              <div className="flex items-center gap-3 mb-10 pl-2">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-[38px] h-[38px] rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/30">
                  P
                </div>
                <h1 className="text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-fill-transparent font-semibold">
                  Prajna ERP
                </h1>
              </div>

              <nav className="flex flex-col gap-1.5 flex-grow">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white">
                  Dashboard
                </Link>

                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsStudentInfoOpen(!isStudentInfoOpen)} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} />
                      Student Information
                    </div>
                    {isStudentInfoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isStudentInfoOpen && (
                    <div className="flex flex-col ml-8 mt-1 gap-1 border-l border-white/10 pl-2">
                      <Link href="/students" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Student Details
                      </Link>
                      <Link href="/students/admission" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Student Admission
                      </Link>
                      <Link href="/students/online-admission" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Online Admission
                      </Link>
                      <Link href="/students/disabled" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Disabled Students
                      </Link>
                      <Link href="/students/multi-class" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Multi Class Student
                      </Link>
                      <Link href="/students/bulk-delete" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Bulk Delete
                      </Link>
                      <Link href="/students/categories" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Student Categories
                      </Link>
                      <Link href="/students/house" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Student House
                      </Link>
                      <Link href="/students/disable-reason" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Disable Reason
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsFrontOfficeOpen(!isFrontOfficeOpen)} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} />
                      Front Office
                    </div>
                    {isFrontOfficeOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isFrontOfficeOpen && (
                    <div className="flex flex-col ml-8 mt-1 gap-1 border-l border-white/10 pl-2">
                      <Link href="/front-office/enquiry" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Admission Enquiry
                      </Link>
                      <Link href="/front-office/visitor" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Visitor Book
                      </Link>
                      <Link href="/front-office/general-call" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Phone Call Log
                      </Link>
                      <Link href="/front-office/dispatch" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Postal Dispatch
                      </Link>
                      <Link href="/front-office/receive" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Postal Receive
                      </Link>
                      <Link href="/front-office/complaint" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Complain
                      </Link>
                      <Link href="/front-office/setup" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Setup Front Office
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/attendance" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white">
                  Attendance Register
                </Link>
                 <div className="flex flex-col">
                  <button 
                    onClick={() => setIsExaminationsOpen(!isExaminationsOpen)} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap size={18} />
                      Examinations
                    </div>
                    {isExaminationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExaminationsOpen && (
                    <div className="flex flex-col ml-8 mt-1 gap-1 border-l border-white/10 pl-2">
                      <Link href="/exams/group" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Exam Group
                      </Link>
                      <Link href="/exams/schedule" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Exam Schedule
                      </Link>
                      <Link href="/exams/result" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Exam Result
                      </Link>
                      <Link href="/exams/design-admit-card" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Design Admit Card
                      </Link>
                      <Link href="/exams/print-admit-card" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Print Admit Card
                      </Link>
                      <Link href="/exams/design-marksheet" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Design Marksheet
                      </Link>
                      <Link href="/exams/print-marksheet" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Print Marksheet
                      </Link>
                      <Link href="/exams/grade" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Marks Grade
                      </Link>
                      <Link href="/exams/division" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Marks Division
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsFeesCollectionOpen(!isFeesCollectionOpen)} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-zinc-400 font-medium text-sm transition-all hover:bg-white/5 hover:text-white w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} />
                      Fees Collection
                    </div>
                    {isFeesCollectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isFeesCollectionOpen && (
                    <div className="flex flex-col ml-8 mt-1 gap-1 border-l border-white/10 pl-2">
                      <Link href="/fees" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Collect Fees
                      </Link>
                      <Link href="/fees/offline-payment" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Offline Bank Payments
                      </Link>
                      <Link href="/fees/search-payment" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Search Fees Payment
                      </Link>
                      <Link href="/fees/search-due" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Search Due Fees
                      </Link>
                      <Link href="/fees/master" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Master
                      </Link>
                      <Link href="/fees/group" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Group
                      </Link>
                      <Link href="/fees/type" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Type
                      </Link>
                      <Link href="/fees/discount" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Discount
                      </Link>
                      <Link href="/fees/carry-forward" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Carry Forward
                      </Link>
                      <Link href="/fees/reminder" className="px-3 py-2 rounded-lg text-zinc-400 text-xs font-medium transition-all hover:bg-white/5 hover:text-white">
                        Fees Reminder
                      </Link>
                    </div>
                  )}
                </div>
              </nav>

              {/* User profile details and logout button */}
              <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 text-xs font-semibold">
                    {user.name?.charAt(0) || 'A'}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 block truncate uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 font-medium text-xs transition-all w-full cursor-pointer"
                >
                  <LogOut size={14} /> Log Out
                </button>

                <div className="text-[11px] text-zinc-600 font-medium pl-2">
                  Session: 2025-26 (Active)
                </div>
              </div>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-grow p-10 overflow-y-auto">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
