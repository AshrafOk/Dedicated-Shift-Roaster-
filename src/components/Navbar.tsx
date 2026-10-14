import React from 'react';
import { ViewTab, UserRole } from '../types/roster';
import {
  Plus,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Upload,
  Download,
  Database,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { KaseyaLogo } from './KaseyaLogo';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenLogModal: () => void;
  year: number;
  month: number;
  onMonthChange: (month: number) => void;
  onOpenImportModal: () => void;
  onExportMasterCsv: () => void;
  userRole: UserRole;
  onOpenAdminModal: () => void;
  onOpenPasswordSettings?: () => void;
  onLockApp?: () => void;
}

const MONTH_OPTIONS = [
  { val: 1, label: 'Jan' },
  { val: 2, label: 'Feb' },
  { val: 3, label: 'Mar' },
  { val: 4, label: 'Apr' },
  { val: 5, label: 'May' },
  { val: 6, label: 'Jun' },
  { val: 7, label: 'Jul' },
  { val: 8, label: 'Aug' },
  { val: 9, label: 'Sep' },
  { val: 10, label: 'Oct' },
  { val: 11, label: 'Nov' },
  { val: 12, label: 'Dec' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenLogModal,
  year,
  month,
  onMonthChange,
  onOpenImportModal,
  onExportMasterCsv,
  userRole,
  onOpenAdminModal,
  onOpenPasswordSettings,
  onLockApp,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Zone with small Kaseya logo and title */}
          <div className="flex items-center gap-3 shrink-0">
            <KaseyaLogo size="sm" showWordmark={true} />
            <div className="h-5 w-px bg-slate-300 hidden lg:block" />
            <div className="hidden sm:flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-800 whitespace-nowrap">
                NOC Dedicated Team Roster
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono tabular-nums">
                {year}
              </span>
            </div>
          </div>

          {/* Zone 2: 4 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                currentTab === 'roster'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${currentTab === 'roster' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Shift Roster</span>
            </button>

            <button
              onClick={() => onTabChange('balances')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                currentTab === 'balances'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${currentTab === 'balances' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Leave Balances</span>
            </button>

            <button
              onClick={() => onTabChange('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                currentTab === 'directory'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${currentTab === 'directory' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Team Directory</span>
            </button>
          </nav>

          {/* Zone 3: Global Month Selector & Primary Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* RBAC Role Switcher Pill & Password Management */}
            {userRole === 'admin' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors shadow-2xs group cursor-pointer"
                  title="Admin Mode Active (Full Edit Permission). Click to switch to Read-Only Viewer mode"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Admin Mode</span>
                  <span className="sm:hidden">Admin</span>
                  <span className="text-[10px] text-emerald-700 underline font-normal group-hover:text-emerald-900">
                    (Switch)
                  </span>
                </button>

                {onOpenPasswordSettings && (
                  <button
                    onClick={onOpenPasswordSettings}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                    title="Change App Entrance Password or Admin Unlock Password"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden md:inline">Change Passwords</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 transition-colors shadow-2xs group cursor-pointer"
                title="Current Mode: Read-Only. Click to enter Admin Password"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Read-Only</span>
                <span className="sm:hidden">Viewer</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider group-hover:bg-blue-700">
                  Unlock
                </span>
              </button>
            )}

            {/* Lock App / Portal */}
            {onLockApp && (
              <button
                onClick={onLockApp}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Lock Portal (Requires App Password to re-enter)"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Lock Portal</span>
              </button>
            )}

            {/* 2026 Month Picker */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <select
                value={month}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                aria-label="Select active month of 2026"
                className="px-2 py-1 text-xs font-bold text-blue-700 bg-white rounded border-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer tabular-nums shadow-2xs"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.val} value={m.val}>
                    {m.label} 2026
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Database Management Tools */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={userRole === 'admin' ? onOpenImportModal : onOpenAdminModal}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  userRole === 'admin'
                    ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    : 'text-slate-500 bg-slate-100/80 border border-slate-200/80 hover:border-amber-400'
                }`}
                title={userRole === 'admin' ? 'Import/upload CSV into database' : 'Admin only: Unlock to import CSV'}
              >
                {userRole === 'admin' ? (
                  <Upload className="w-3 h-3 text-slate-500" />
                ) : (
                  <Lock className="w-3 h-3 text-amber-600" />
                )}
                <span>Import CSV</span>
              </button>

              <button
                onClick={userRole === 'admin' ? onExportMasterCsv : onOpenAdminModal}
                disabled={userRole !== 'admin'}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  userRole === 'admin'
                    ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer'
                    : 'text-slate-400 bg-slate-100/70 border border-slate-200/80 cursor-not-allowed opacity-60'
                }`}
                title={
                  userRole === 'admin'
                    ? 'Export complete 2026 database CSV'
                    : 'Export DB is disabled in Read-Only mode. Admin access required.'
                }
              >
                {userRole === 'admin' ? (
                  <Download className="w-3 h-3 text-slate-500" />
                ) : (
                  <Lock className="w-3 h-3 text-amber-600" />
                )}
                <span>Export DB</span>
                {userRole !== 'admin' && (
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-mono font-semibold">
                    Admin
                  </span>
                )}
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={userRole === 'admin' ? onOpenLogModal : onOpenAdminModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-xs whitespace-nowrap ${
                userRole === 'admin'
                  ? 'text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300'
              }`}
              title={userRole === 'admin' ? 'Log Leave or Assign Shift' : 'Admin only: Unlock to log leave/shift'}
            >
              {userRole === 'admin' ? (
                <Plus className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-700" />
              )}
              <span>{userRole === 'admin' ? 'Log Leave/Shift' : 'Unlock to Edit'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('roster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'roster' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Shift Roster
          </button>
          <button
            onClick={() => onTabChange('balances')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'balances' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Leave Balances
          </button>
          <button
            onClick={() => onTabChange('directory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === 'directory' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Directory
          </button>
        </div>
      </div>
    </header>
  );
};
