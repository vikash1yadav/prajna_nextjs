'use client';

import React from 'react';
import StudentForm from '@/components/students/StudentForm';

export default function StudentAdmissionPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Student Admission</h2>
        <p className="text-zinc-400 text-sm">Enroll a new student by filling out their comprehensive details below.</p>
      </div>

      <div className="glass-card flex-grow overflow-hidden p-0 m-0">
        <div className="h-full w-full p-6 bg-zinc-950/40 rounded-xl overflow-hidden flex flex-col">
          <StudentForm 
            mode="page" 
            formMode="add"
          />
        </div>
      </div>
    </div>
  );
}
