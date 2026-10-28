import React from 'react';
import { ViewTab } from '../types/roster';
import { AppUser, isGlobalAdmin } from '../types/user';
import {
  Calendar,
  BarChart3,
  Users,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
  Layers,
  User,
  Sparkles,
} from 'lucide-react';
import { KaseyaLogo } from './KaseyaLogo';
import { useISTClock } from '../utils/istUtils';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  year: number;
  teamName: string;
  currentUser: AppUser | null;
  canEdit: boolean;
  onLogout: () => void;
  onOpenAdminPage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  year,
  teamName,
  currentUser,
  canEdit,
  onLogout,
  onOpenAdminPage,
}) => {
  const ist = useISTClock();
  const isMaster = isGlobalAdmin(currentUser);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Zone with Kaseya Logo & Team Title */}
          <div className="flex items-center gap-3 shrink-0">
            <KaseyaLogo size="sm" showWordmark={true} />
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
                NOC {teamName} Roster
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded font-mono tabular-nums">
                {year}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shift Roster</span>
            </button>

            <button
              onClick={() => onTabChange('balances')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'balances'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Leave Balances</span>
            </button>

            <button
              onClick={() => onTabChange('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          </nav>

          {/* Zone 3: IST Clock, User Role Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Indian Standard Time (IST) Clock & Date Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200/80 text-xs shadow-2xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live IST Synchronization Active" />
              <span className="font-bold text-blue-950">🇮🇳 IST:</span>
              <span className="text-blue-900 font-semibold">{ist.formattedDate}</span>
              <span className="text-blue-300">|</span>
              <span className="text-blue-700 font-bold tabular-nums">{ist.formattedTime}</span>
            </div>

            {/* User Identity & Role Badge */}
            {currentUser && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-2xs ${
                  isMaster
                    ? 'bg-purple-50 text-purple-900 border-purple-300'
                    : canEdit
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title={`Logged in user: ${currentUser.username} | Group: ${currentUser.group} | Permission: ${currentUser.permission}`}
              >
                {isMaster ? (
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                ) : canEdit ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className="font-bold text-slate-900">{currentUser.username}</span>
                <span className="text-[10px] opacity-80 font-mono hidden sm:inline">
                  ({currentUser.group === 'Global Admin' ? 'Global Admin' : canEdit ? 'Admin' : 'View Only'})
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Logout / Lock Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('roster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
              currentTab === 'roster' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Shift Roster
          </button>
          <button
            onClick={() => onTabChange('balances')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
              currentTab === 'balances' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Leave Balances
          </button>
          <button
            onClick={() => onTabChange('directory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
              currentTab === 'directory' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Directory
          </button>
        </div>
      </div>
    </header>
  );
};
