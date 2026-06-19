'use client';

import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      
      if (json.success) {
        localStorage.setItem('token', json.data.token);
        localStorage.setItem('user', JSON.stringify(json.data.user));
        document.cookie = `token=${json.data.token}; path=/; max-age=28800;`;
        
        if (onLoginSuccess) {
          onLoginSuccess(json.data.user);
        } else {
          window.location.reload();
        }
      } else {
        setError(json.error?.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      setError('A connection error occurred. Verify the API status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.05)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(168,85,247,0.05)_0%,transparent_40%),#09090b] p-6">
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Brand Logo header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-[50px] h-[50px] rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-500/20">
            P
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">Prajna School ERP</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Administration Desk</p>
        </div>

        {/* Login Card */}
        <Card className="border-white/5 bg-zinc-950/70 backdrop-blur-xl shadow-2xl p-2 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white">Sign In</CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-1">Access dashboard modules and controls.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="email"
                    className="pl-10 h-10 border-white/10 bg-zinc-900/50 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="admin@prajnaerp.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="password"
                    className="pl-10 h-10 border-white/10 bg-zinc-900/50 text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" /> Verifying...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wider">PrajnaERP v7.1.0 • Modernized Portal</span>
        </div>
      </div>
    </div>
  );
}
