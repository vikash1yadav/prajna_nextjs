'use client';

import React from 'react';
import useSWR, { mutate } from 'swr';
import { Star, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function TeachersRatingPage() {
  const { data: ratingRes, isLoading } = useSWR('/api/staff-ratings', fetcher);
  const ratingsList = ratingRes?.data || [];

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/staff-ratings/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        mutate('/api/staff-ratings');
      } else {
        alert(data.message || 'Failed to update rating status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    }
  };

  const renderStars = (rate) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= rate ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
          <Star size={28} className="fill-emerald-400/20" /> Teachers Rating
        </h2>
        <p className="text-zinc-400 text-sm">Review student/parent feedback and manage the visibility status of teacher ratings.</p>
      </div>

      {/* Directory Listings */}
      <div className="glass-card !p-0 overflow-hidden border-emerald-500/10">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-zinc-500" />
            Feedback Register
          </h3>
          <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
            Total: {ratingsList.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 animate-pulse">Loading ratings registry...</div>
        ) : ratingsList.length > 0 ? (
          <div className="table-container !mt-0 !border-none overflow-x-auto">
            <table className="data-table whitespace-nowrap">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Submitted By</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {ratingsList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="font-semibold text-white">
                      <div>{item.firstname} {item.lastname}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.employee_id}</div>
                    </td>
                    <td className="text-zinc-300 font-medium text-xs">
                      <div>{item.role || 'Guest'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {item.user_id}</div>
                    </td>
                    <td>{renderStars(item.rate)}</td>
                    <td className="text-zinc-400 text-xs italic whitespace-normal max-w-xs break-words">
                      "{item.comment || 'No comment.'}"
                    </td>
                    <td>
                      {item.status === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                          <XCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="text-right flex justify-end gap-2 p-3">
                      <button 
                        onClick={() => handleToggleStatus(item)} 
                        className={`btn py-1 px-3 text-xs flex items-center gap-1 border transition-colors ${
                          item.status === 1 
                            ? 'text-zinc-400 border-zinc-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                            : 'btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white'
                        }`}
                      >
                        {item.status === 1 ? 'Disapprove' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">No ratings or feedbacks submitted yet.</div>
        )}
      </div>
    </div>
  );
}
