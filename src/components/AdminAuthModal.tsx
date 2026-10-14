import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, Lock, Unlock, Eye, CheckCircle2, X, Sparkles, Building2 } from 'lucide-react';
import { UserRole } from '../types/roster';

import { verifyAdminPassword } from '../utils/authUtils';

interface AdminAuthModalProps {
  currentRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (role: UserRole) => void;
  onShowToast: (msg: string) => void;
  onOpenPasswordSettings?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  currentRole,
  isOpen,
  onClose,
  onRoleChange,
  onShowToast,
  onOpenPasswordSettings,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = () => {
    const code = passcode.trim();
    if (verifyAdminPassword(code)) {
      onRoleChange('admin');
      setError(null);
      setPasscode('');
      onShowToast('Admin Mode Unlocked: You now have full permission to edit shifts, log leaves, and import data.');
      onClose();
    } else {
      setError('Incorrect admin password. Please try again.');
    }
  };

  const handleSwitchToViewer = () => {
    onRoleChange('viewer');
    onShowToast('Switched to Read-Only Viewer Mode: Shift cells and balance edits are now protected.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-800/80 rounded-xl border border-blue-700/60 shadow-xs">
              {currentRole === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-blue-300" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {currentRole === 'admin' ? 'Administrator Mode Active' : 'Unlock Administrator Access'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Role-Based Permission Security (RBAC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {currentRole === 'admin' ? (
            /* Currently Admin -> Option to switch to Read-Only */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full Edit Permissions Enabled</span>
                </div>
                <p className="leading-relaxed">
                  You are currently authenticated as an <strong>Administrator</strong>. You can edit cells in the shift grid, add leaves, import CSV files, and adjust quotas.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                {onOpenPasswordSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPasswordSettings();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-blue-200" />
                    <span>Change App or Admin Passwords</span>
                  </button>
                )}

                <button
                  onClick={handleSwitchToViewer}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Switch to Read-Only (Viewer Mode) to test restrictions</span>
                </button>
              </div>
            </div>
          ) : (
            /* Currently Viewer -> Password prompt to unlock Admin */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
                <p>
                  You are currently in <strong>Read-Only Mode</strong>. Viewers can inspect shifts and attendance, but cannot alter roster cells or modify leave records.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUnlock();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Password:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      autoComplete="new-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="Enter admin password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Eye className={`w-3.5 h-3.5 ${showPassword ? 'text-blue-600' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Admin</span>
                </button>
              </form>
            </div>
          )}

          {/* Microsoft 365 Architecture Explanation Note */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-5 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Microsoft 365 (Azure AD) Single Sign-On:</span>
            </div>
            <p className="leading-relaxed text-slate-500">
              When synced with your company’s M365 tenant, users log in with their work email. M365 Security Groups (e.g. <em>NOC Leads</em> vs <em>NOC Engineers</em>) automatically grant Admin or Read-Only view without needing manual passcodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
