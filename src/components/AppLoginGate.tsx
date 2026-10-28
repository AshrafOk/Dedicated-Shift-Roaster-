import React, { useState } from 'react';
import {
  authenticateUser,
  setCurrentUser,
  updateUser,
  loadUsers,
} from '../utils/userManagement';
import { AppUser } from '../types/user';
import { KaseyaLogo } from './KaseyaLogo';
import {
  Lock,
  User,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AppLoginGateProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const AppLoginGate: React.FC<AppLoginGateProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // First-time password change state
  const [pendingUser, setPendingUser] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = authenticateUser(username, password);
      setIsLoading(false);

      if (result.error || !result.user) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      const authenticatedUser = result.user;

      // Check if user must change password on first login
      if (authenticatedUser.mustChangePassword) {
        setPendingUser(authenticatedUser);
      } else {
        setCurrentUser(authenticatedUser);
        onLoginSuccess(authenticatedUser);
      }
    }, 250);
  };

  const handleFirstTimePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);

    if (!pendingUser) return;

    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    if (newPassword === pendingUser.password) {
      setChangePasswordError('New password cannot be the same as your initial temporary password.');
      return;
    }

    try {
      const updated = updateUser(pendingUser.id, {
        password: newPassword,
        mustChangePassword: false,
      });

      setCurrentUser(updated);
      onLoginSuccess(updated);
    } catch (err: any) {
      setChangePasswordError(err?.message || 'Failed to update password.');
    }
  };

  // Quick fill helper for convenience
  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-4">
            <KaseyaLogo size="md" showWordmark={true} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            NOC Multi-Team Roster Portal
          </h1>
          <p className="text-xs text-blue-200/80 mt-1.5">
            2026 Shift Management &amp; Centralized Role Access
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white/95 backdrop-blur-xl text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {!pendingUser ? (
            /* Standard Username & Password Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  User Authentication
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  IST 24x7 Portal
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Ashraf, elite_admin, dedicated_viewer"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Login to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Master Global Admin Info Box */}
              <div className="pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Master Global Admin Account
                    </span>
                    <button
                      type="button"
                      onClick={() => quickFill('Ashraf', 'India123!!')}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-blue-800 space-y-0.5">
                    <div>Username: <strong className="text-slate-900">Ashraf</strong></div>
                    <div>Password: <strong className="text-slate-900">India123!!</strong></div>
                  </div>
                </div>

                {/* Quick Switch Helper for Team Testing */}
                <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">Test accounts:</span>
                  <button
                    type="button"
                    onClick={() => quickFill('elite_admin', 'Elite2026!@#')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-mono"
                  >
                    elite_admin
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('elite_viewer', 'Elite2026!@#')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-mono"
                    title="User with mustChangePassword flag"
                  >
                    elite_viewer (1st login)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* First-Time Login Enforced Password Change Form */
            <form onSubmit={handleFirstTimePasswordChange} className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-100">
                <div className="inline-flex p-2.5 rounded-full bg-amber-100 text-amber-700 mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  First-Time Login Password Change
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome <strong>{pendingUser.username}</strong> ({pendingUser.group} - {pendingUser.permission === 'admin' ? 'Admin' : 'View Only'}). Please set a new password to proceed.
                </p>
              </div>

              {changePasswordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password (min 6 chars)"
                    required
                    autoFocus
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save New Password &amp; Enter Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setPendingUser(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
