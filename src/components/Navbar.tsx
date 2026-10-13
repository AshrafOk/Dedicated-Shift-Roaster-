import React from 'react';
import { ViewTab } from '../types/roster';
import {
  Plus,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Upload,
  Download,
  Database,
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
                onClick={onOpenImportModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Import/upload CSV into database"
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={onExportMasterCsv}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Export complete 2026 database CSV"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span>Export DB</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Leave/Shift</span>
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
