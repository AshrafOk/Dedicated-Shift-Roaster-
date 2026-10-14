import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  updateAppPassword,
  updateAdminPassword,
  getAppPassword,
  getAdminPassword,
} from '../utils/authUtils';

interface AdminPasswordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

type PasswordTarget = 'app' | 'admin';

export const AdminPasswordSettingsModal: React.FC<AdminPasswordSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [target, setTarget] = useState<PasswordTarget>('app');

  // Form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');

  // Visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showReenter, setShowReenter] = useState(false);

  // Status/error states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setReenterPassword('');
    setError(null);
    setSuccess(null);
    setShowOld(false);
    setShowNew(false);
    setShowReenter(false);
  };

  const handleTabChange = (newTarget: PasswordTarget) => {
    setTarget(newTarget);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword) {
      setError('Please provide your current old password.');
      return;
    }
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== reenterPassword) {
      setError('New Password and Re-entered New Password do not match.');
      return;
    }

    setIsSubmitting(true);

    const result =
      target === 'app'
        ? updateAppPassword(oldPassword, newPassword, reenterPassword)
        : updateAdminPassword(oldPassword, newPassword, reenterPassword);

    setIsSubmitting(false);

    if (result.success) {
      const msg =
        target === 'app'
          ? 'App entrance password updated successfully! Team members must now use this new password to enter.'
          : 'Admin privilege password updated successfully! Keep your new admin credential safe.';
      setSuccess(msg);
      onShowToast(msg);
      setOldPassword('');
      setNewPassword('');
      setReenterPassword('');
    } else {
      setError(result.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-500/30 shadow-xs">
              <KeyRound className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Security & Password Management
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Admin Only
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Update App Entrance Password or Admin Unlock Password
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: App Password vs Admin Password */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('app')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              target === 'app'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${target === 'app' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Change App Password</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              target === 'admin'
                ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${target === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Change Admin Password</span>
          </button>
        </div>

        {/* Description Banner */}
        <div className="px-6 pt-4">
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-blue-950 space-y-1">
            <p className="font-bold">
              {target === 'app'
                ? '🔑 App Entrance Password (Gatekeeper)'
                : '🛡️ Admin Privilege Password (Full Control)'}
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {target === 'app'
                ? 'This password protects the initial entrance to the portal. Anyone visiting the app must enter this password to view the roster. To change it, provide the old password, your new password, and re-enter the new password.'
                : 'This password protects administrative actions (editing shift cells, logging leave, importing CSVs, quota adjustments). To change it, provide the old password, your new password, and re-enter the new password.'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field 1: Old Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Current (Old) Password:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showOld ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={`Enter current ${target === 'app' ? 'app' : 'admin'} password`}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showOld ? 'Hide password' : 'Show password'}
              >
                {showOld ? (
                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Field 2: New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. New Password:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? (
                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Field 3: Re-enter New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Re-enter New Password:
            </label>
            <div className="relative">
              <CheckCircle2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showReenter ? 'text' : 'password'}
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Re-type new password to confirm"
                value={reenterPassword}
                onChange={(e) => {
                  setReenterPassword(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                className={`w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white font-mono ${
                  reenterPassword && newPassword && reenterPassword !== newPassword
                    ? 'border-rose-300 focus:ring-rose-500'
                    : reenterPassword && newPassword && reenterPassword === newPassword
                    ? 'border-emerald-300 focus:ring-emerald-500'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowReenter(!showReenter)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showReenter ? 'Hide password' : 'Show password'}
              >
                {showReenter ? (
                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>Save New {target === 'app' ? 'App' : 'Admin'} Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
