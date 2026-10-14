import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert, Sparkles, Building2, Clock } from 'lucide-react';
import { verifyAppPassword, setAppAuthenticated } from '../utils/authUtils';
import { useISTClock } from '../utils/istUtils';

interface AppPasswordGateProps {
  onUnlockSuccess: () => void;
}

export const AppPasswordGate: React.FC<AppPasswordGateProps> = ({ onUnlockSuccess }) => {
  const ist = useISTClock();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the app password to continue.');
      return;
    }

    setIsSubmitting(true);
    if (verifyAppPassword(password)) {
      setError(null);
      setAppAuthenticated(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onUnlockSuccess();
      }, 250);
    } else {
      setIsSubmitting(false);
      setError('Incorrect App Password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-sm tracking-tighter text-blue-400">NOC</span>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Kaseya NOC Portal 2026
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                Protected Portal
              </span>
            </h1>
            <p className="text-xs text-blue-300/70">
              Network Operations Center • 24/7 Shift & Leave Management
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Access Controlled</span>
        </div>
      </header>

      {/* Main Center Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-blue-500/30 p-7 sm:p-8 shadow-2xl shadow-blue-950/80">
          {/* Badge Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-blue-500/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Heading & Live IST Badge */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-xs text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">IST:</span>
              <span className="font-mono text-blue-200">{ist.formattedDate} • {ist.formattedTime}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Sign In to Enter Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              This application operates on Indian Standard Time (IST). Logging in automatically loads today's roster ({ist.formattedDate}).
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                App Access Password:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Enter app password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-11 py-3 text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-2.5 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300 animate-in fade-in duration-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Enter App & View Roster'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Info footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Kaseya NOC Infrastructure
            </span>
            <span className="font-mono text-slate-400">Year 2026 Master</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="max-w-6xl w-full mx-auto py-3 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Kaseya Network Operations Center. Protected Access System.
      </footer>
    </div>
  );
};
