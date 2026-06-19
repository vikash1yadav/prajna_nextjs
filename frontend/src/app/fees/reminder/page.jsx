'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { BellRing, Save, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function FeesReminderPage() {
  const { data: response, error, isLoading } = useSWR('/api/fees/reminders', fetcher);
  const items = response?.data || [];

  // Local state for tracking edited fields
  const [reminders, setReminders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync state with SWR data
  useEffect(() => {
    if (items.length > 0) {
      setReminders(items.map(item => ({
        id: item.id,
        type: item.type,
        day: item.day,
        is_active: item.is_active
      })));
    }
  }, [items]);

  const handleDayChange = (id, val) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, day: parseInt(val) || 0 } : r));
  };

  const handleActiveToggle = (id) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, is_active: r.is_active === 1 ? 0 : 1 } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/fees/reminders/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Fees reminder settings saved successfully!' });
        mutate('/api/fees/reminders');
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to update reminder settings' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to the server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-indigo-500 flex items-center gap-2">
          <BellRing size={28} /> Fees Reminder
        </h2>
        <p className="text-zinc-400 text-sm">Configure automated notifications and overdue alerts sent to parents/guardians before or after the fee due date.</p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-lg border text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {statusMessage.text}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 animate-pulse glass-card border-indigo-500/10">
          Loading reminder configurations...
        </div>
      ) : error ? (
        <div className="p-12 text-center text-rose-400 glass-card border-indigo-500/10">
          Failed to load reminder settings.
        </div>
      ) : reminders.length > 0 ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reminders.map((r) => {
              // Human-friendly labels
              let title = r.type;
              let desc = '';
              if (r.type === 'active_reminder') {
                title = 'Active Reminder';
                desc = 'Send daily reminder alert starting specified days before due date.';
              } else if (r.type === 'reminder1') {
                title = 'First Overdue Reminder';
                desc = 'Send overdue alert specified days after due date passes.';
              } else if (r.type === 'reminder2') {
                title = 'Second Overdue Reminder';
                desc = 'Send follow-up overdue alert specified days after due date.';
              }

              const isActive = r.is_active === 1;

              return (
                <div key={r.id} className={`glass-card border flex flex-col justify-between transition-all ${isActive ? 'border-indigo-500/20 bg-indigo-500/[0.02]' : 'border-white/5 opacity-70'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{title}</h3>
                      <button
                        type="button"
                        onClick={() => handleActiveToggle(r.id)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {isActive ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="text-zinc-500 flex items-center gap-1 text-xs font-bold bg-white/5 px-2 py-1 rounded-full border border-white/5">
                            Disabled
                          </span>
                        )}
                      </button>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-6">{desc}</p>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Days Interval</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        className="input-field py-1.5 px-3 text-sm font-semibold max-w-[120px]"
                        value={r.day}
                        onChange={(e) => handleDayChange(r.id, e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span className="text-zinc-400 text-xs font-medium">Days</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 px-8 py-3 flex items-center gap-2 font-bold"
            >
              <Save size={18} /> Save Reminders Config
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card py-12 text-center text-zinc-500 border-indigo-500/10">
          No reminder settings found in database.
        </div>
      )}
    </div>
  );
}
