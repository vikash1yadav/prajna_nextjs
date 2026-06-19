'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  UserCheck, 
  Activity,
  ArrowUpRight 
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-zinc-400 text-lg animate-pulse">Loading admin dashboard statistics...</div>
      </div>
    );
  }

  const stats = data || {
    fees_awaiting: { unpaid: 0, total: 0 },
    staff_leaves: { approved: 0, total: 0 },
    student_leaves: { approved: 0, total: 0 },
    converted_leads: { converted: 0, total: 0 },
    staff_present: { present: 0, total: 0 },
    student_present: { present: 0, total: 0 },
    monthly_fees_expenses: [],
    session_fees_expenses: [],
    income_sources: [],
    expense_sources: []
  };

  const getPercentage = (num, den) => {
    if (!den) return 0;
    return Math.round((num / den) * 100);
  };

  const currentYearName = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  // 6 KPI cards definition helper
  const kpiCards = [
    {
      title: 'Fees Awaiting Payment',
      value: `${stats.fees_awaiting.unpaid}/${stats.fees_awaiting.total}`,
      percentage: getPercentage(stats.fees_awaiting.unpaid, stats.fees_awaiting.total),
      colorClass: 'text-amber-400',
      bgColorClass: 'bg-amber-500/10',
      barColor: 'bg-amber-500',
      icon: DollarSign
    },
    {
      title: 'Staff Approved Leave',
      value: `${stats.staff_leaves.approved}/${stats.staff_leaves.total}`,
      percentage: getPercentage(stats.staff_leaves.approved, stats.staff_leaves.total),
      colorClass: 'text-indigo-400',
      bgColorClass: 'bg-indigo-500/10',
      barColor: 'bg-indigo-500',
      icon: Users
    },
    {
      title: 'Student Approved Leave',
      value: `${stats.student_leaves.approved}/${stats.student_leaves.total}`,
      percentage: getPercentage(stats.student_leaves.approved, stats.student_leaves.total),
      colorClass: 'text-emerald-400',
      bgColorClass: 'bg-emerald-500/10',
      barColor: 'bg-emerald-500',
      icon: GraduationCap
    },
    {
      title: 'Converted Leads',
      value: `${stats.converted_leads.converted}/${stats.converted_leads.total}`,
      percentage: getPercentage(stats.converted_leads.converted, stats.converted_leads.total),
      colorClass: 'text-blue-400',
      bgColorClass: 'bg-blue-500/10',
      barColor: 'bg-blue-500',
      icon: TrendingUp
    },
    {
      title: 'Staff Present Today',
      value: `${stats.staff_present.present}/${stats.staff_present.total}`,
      percentage: getPercentage(stats.staff_present.present, stats.staff_present.total),
      colorClass: 'text-rose-400',
      bgColorClass: 'bg-rose-500/10',
      barColor: 'bg-rose-500',
      icon: UserCheck
    },
    {
      title: 'Student Present Today',
      value: `${stats.student_present.present}/${stats.student_present.total}`,
      percentage: getPercentage(stats.student_present.present, stats.student_present.total),
      colorClass: 'text-violet-400',
      bgColorClass: 'bg-violet-500/10',
      barColor: 'bg-violet-500',
      icon: Activity
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Anjani Creations Dashboard</h2>
        <p className="text-zinc-400 text-sm">Session: 2025-26 (Active) • Real-time stats across departments.</p>
      </div>

      {/* KPI Cards Grid (6 items) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div key={idx} className="glass-card flex flex-col justify-between p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 text-sm font-medium tracking-wide">{card.title}</span>
                <div className={`${card.bgColorClass} ${card.colorClass} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent size={20} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-3xl font-bold tracking-tight text-white">{card.value}</h3>
                  <span className="text-zinc-500 text-xs font-semibold">{card.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div 
                    className={`${card.barColor} h-1.5 rounded-full transition-all duration-1000`} 
                    style={{ width: `${card.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Fees Collection & Expenses for Current Month */}
        <div className="glass-card lg:col-span-2 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white">Fees Collection & Expenses</h4>
              <p className="text-zinc-400 text-xs mt-0.5">Daily report for {currentMonthName} {currentYearName}</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400" />
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly_fees_expenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Collection" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Income Distribution */}
        <div className="glass-card lg:col-span-1 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white">Income Sources</h4>
              <p className="text-zinc-400 text-xs mt-0.5">By category for {currentMonthName}</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400" />
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.income_sources} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="url(#incomeGrad)" radius={[0, 4, 4, 0]}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fees Collection & Expenses for current Session */}
        <div className="glass-card lg:col-span-2 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white">Session Analytics</h4>
              <p className="text-zinc-400 text-xs mt-0.5">Monthly overview for Session 2025-26</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400" />
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.session_fees_expenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Collection" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Expense Distribution */}
        <div className="glass-card lg:col-span-1 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white">Expense Distribution</h4>
              <p className="text-zinc-400 text-xs mt-0.5">By category for {currentMonthName}</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-400" />
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.expense_sources} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="url(#expenseGrad)" radius={[0, 4, 4, 0]}>
                  <defs>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
