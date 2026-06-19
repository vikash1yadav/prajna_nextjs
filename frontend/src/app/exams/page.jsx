'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/exams/group');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-zinc-500 text-sm animate-pulse">Redirecting to Exam Groups...</div>
    </div>
  );
}
