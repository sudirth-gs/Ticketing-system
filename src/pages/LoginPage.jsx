import React, { useState } from 'react';
import { Mail, Lock, Shield, User, ArrowRight } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isRegister) {
        // Register customer account
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role: 'customer' })
        });

        if (response.ok) {
          const user = await response.json();
          setSuccess('Account created successfully! Logging you in...');
          setTimeout(() => {
            onLogin(user);
          }, 1500);
        } else {
          const err = await response.json();
          setError(err.error || 'Registration failed');
        }
      } else {
        // Login
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const user = await response.json();
          onLogin(user);
        } else {
          const err = await response.json();
          setError(err.error || 'Invalid credentials');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the authentication server.');
    }
  };

  const handleQuickLogin = async (roleType) => {
    setError('');
    setSuccess('');
    let qEmail = '';
    let qPassword = 'customer123';

    if (roleType === 'customer1') {
      qEmail = 'customer@example.com';
    } else if (roleType === 'customer2') {
      qEmail = 'alice@example.com';
    } else if (roleType === 'admin') {
      qEmail = 'admin';
      qPassword = 'admin123';
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: qEmail, password: qPassword })
      });

      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        const err = await response.json();
        setError(err.error || 'Quick login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the authentication server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">SupportPortal</h2>
          <p className="text-slate-400 text-sm mt-1">
            {isRegister ? 'Create a support customer account' : 'Sign in to manage your support requests'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-slate-355 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-355 text-xs font-semibold uppercase tracking-wider mb-2">
              {isRegister ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? "you@example.com" : "admin or customer@example.com"}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-355 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer text-sm"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="text-indigo-400 hover:text-indigo-350 text-xs font-semibold cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need a customer account? Register Here'}
          </button>
        </div>

        {/* Quick Logins (For College Project / Easy Testing) */}
        {!isRegister && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-slate-400 text-xs font-medium text-center mb-4">Quick Sign-In (for grading & testing)</p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="w-full bg-slate-950/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 text-sm font-medium py-2.5 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>admin (Admin)</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-900/30">Select</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
